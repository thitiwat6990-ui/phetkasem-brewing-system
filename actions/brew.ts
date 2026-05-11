"use server"

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const brewSchema = z.object({
  tankId: z.number(),
  recipeId: z.number(),
  volume: z.number().min(1).max(60),
});

export async function startBrewAction(formData: FormData) {
  // Extract and validate data
  const parseResult = brewSchema.safeParse({
    tankId: Number(formData.get('tankId')),
    recipeId: Number(formData.get('recipeId')),
    volume: Number(formData.get('volume')),
  });

  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters.' };
  }

  const { tankId, recipeId, volume } = parseResult.data;
  const client = await db.connect();

  try {
    await client.sql`BEGIN`;

    // 1. Validate tank is empty and exists
    const tankResult = await client.sql`SELECT capacity, is_active FROM tanks WHERE id = ${tankId}`;
    const tank = tankResult.rows[0];
    
    if (!tank) throw new Error('Tank not found.');
    if (tank.is_active) throw new Error('Tank is already active.');
    if (volume > tank.capacity) throw new Error(`Volume exceeds tank capacity of ${tank.capacity}L.`);

    // 2. Calculate required materials
    const ingredientsResult = await client.sql`SELECT material_id, amount_per_liter FROM recipe_ingredients WHERE recipe_id = ${recipeId}`;
    const ingredients = ingredientsResult.rows;
    
    // 3. Validate stock availability
    for (const ingredient of ingredients) {
      const requiredAmount = ingredient.amount_per_liter * volume;
      const materialResult = await client.sql`SELECT name, quantity FROM materials WHERE id = ${ingredient.material_id}`;
      const material = materialResult.rows[0];
      
      if (!material) throw new Error('Material not found.');
      if (material.quantity < requiredAmount) {
        throw new Error(`Insufficient stock for ${material.name}. Required: ${requiredAmount}, Available: ${material.quantity}`);
      }
    }

    // 4. Deduct materials
    for (const ingredient of ingredients) {
      const requiredAmount = ingredient.amount_per_liter * volume;
      await client.sql`UPDATE materials SET quantity = quantity - ${requiredAmount} WHERE id = ${ingredient.material_id}`;
    }

    // 5. Create brew_batch
    const brewDate = new Date().toISOString(); // Store UTC
    const insertBrewResult = await client.sql`
      INSERT INTO brew_batches (recipe_id, tank_id, volume, brew_date, status)
      VALUES (${recipeId}, ${tankId}, ${volume}, ${brewDate}, 'fermenting')
      RETURNING id
    `;
    const newBatchId = insertBrewResult.rows[0].id;

    // 6. Mark tank as active
    await client.sql`UPDATE tanks SET is_active = true WHERE id = ${tankId}`;

    // 7. Write audit logs
    await client.sql`INSERT INTO logs (type, message) VALUES ('brew', ${`Started brew batch #${newBatchId} in Tank #${tankId} with ${volume}L`})`;
    await client.sql`INSERT INTO logs (type, message) VALUES ('stock', ${`Deducted materials for brew batch #${newBatchId}`})`;

    await client.sql`COMMIT`;
  } catch (err: any) {
    await client.sql`ROLLBACK`;
    return { success: false, error: err.message || 'An unexpected error occurred during the transaction.' };
  } finally {
    client.release();
  }

  revalidatePath('/');
  return { success: true };
}

export async function getBrewDetailsAction(batchId: number, recipeId: number) {
  const client = await db.connect();
  try {
    const ingredientsResult = await client.sql`
      SELECT m.name, m.unit, ri.amount_per_liter 
      FROM recipe_ingredients ri
      JOIN materials m ON ri.material_id = m.id
      WHERE ri.recipe_id = ${recipeId}
    `;

    const reservationsResult = await client.sql`
      SELECT customer_name, quantity, created_at 
      FROM reservations 
      WHERE brew_batch_id = ${batchId}
    `;

    return { success: true, ingredients: ingredientsResult.rows, reservations: reservationsResult.rows };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

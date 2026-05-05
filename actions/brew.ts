"use server"

import { z } from 'zod';
import db from '@/lib/db';
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

  try {
    // Better-sqlite3 transaction ensures atomicity
    const executeBrewTransaction = db.transaction(() => {
      // 1. Validate tank is empty and exists
      const tank = db.prepare('SELECT capacity, is_active FROM tanks WHERE id = ?').get(tankId) as { capacity: number; is_active: number } | undefined;
      if (!tank) throw new Error('Tank not found.');
      if (tank.is_active) throw new Error('Tank is already active.');
      if (volume > tank.capacity) throw new Error(`Volume exceeds tank capacity of ${tank.capacity}L.`);

      // 2. Calculate required materials
      const ingredients = db.prepare('SELECT material_id, amount_per_liter FROM recipe_ingredients WHERE recipe_id = ?').all(recipeId) as Array<{ material_id: number; amount_per_liter: number }>;
      
      // 3. Validate stock availability
      for (const ingredient of ingredients) {
        const requiredAmount = ingredient.amount_per_liter * volume;
        const material = db.prepare('SELECT name, quantity FROM materials WHERE id = ?').get(ingredient.material_id) as { name: string; quantity: number } | undefined;
        
        if (!material) throw new Error('Material not found.');
        if (material.quantity < requiredAmount) {
          throw new Error(`Insufficient stock for ${material.name}. Required: ${requiredAmount}, Available: ${material.quantity}`);
        }
      }

      // 4. Deduct materials
      const updateMaterial = db.prepare('UPDATE materials SET quantity = quantity - ? WHERE id = ?');
      for (const ingredient of ingredients) {
        const requiredAmount = ingredient.amount_per_liter * volume;
        updateMaterial.run(requiredAmount, ingredient.material_id);
      }

      // 5. Create brew_batch
      const brewDate = new Date().toISOString(); // Store UTC
      const insertBrew = db.prepare(`
        INSERT INTO brew_batches (recipe_id, tank_id, volume, brew_date, status)
        VALUES (?, ?, ?, ?, 'fermenting')
      `);
      const brewResult = insertBrew.run(recipeId, tankId, volume, brewDate);

      // 6. Mark tank as active
      db.prepare('UPDATE tanks SET is_active = 1 WHERE id = ?').run(tankId);

      // 7. Write audit logs
      const insertLog = db.prepare('INSERT INTO logs (type, message) VALUES (?, ?)');
      insertLog.run('brew', `Started brew batch #${brewResult.lastInsertRowid} in Tank #${tankId} with ${volume}L`);
      insertLog.run('stock', `Deducted materials for brew batch #${brewResult.lastInsertRowid}`);
    });

    executeBrewTransaction();
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during the transaction.' };
  }
}

export async function getBrewDetailsAction(batchId: number, recipeId: number) {
  try {
    const ingredients = db.prepare(`
      SELECT m.name, m.unit, ri.amount_per_liter 
      FROM recipe_ingredients ri
      JOIN materials m ON ri.material_id = m.id
      WHERE ri.recipe_id = ?
    `).all(recipeId) as any[];

    const reservations = db.prepare(`
      SELECT customer_name, quantity, created_at 
      FROM reservations 
      WHERE brew_batch_id = ?
    `).all(batchId) as any[];

    return { success: true, ingredients, reservations };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

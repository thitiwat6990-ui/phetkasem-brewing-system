"use server"

import { sql } from '@/lib/db';
import { Tank, InventoryItem, Recipe, Batch, KegBatch, LogEntry } from '@/lib/mockData';

export async function getInitialState() {
  try {
    const tanksRes = await sql`SELECT details FROM tanks WHERE details IS NOT NULL`;
    const inventoryRes = await sql`SELECT details FROM materials WHERE details IS NOT NULL`;
    const recipesRes = await sql`SELECT details FROM recipes WHERE details IS NOT NULL`;
    const batchesRes = await sql`SELECT details FROM brew_batches WHERE details IS NOT NULL`;
    const kegBatchesRes = await sql`SELECT details FROM keg_batches WHERE details IS NOT NULL`;
    const logsRes = await sql`SELECT id, timestamp, username as user, action, details FROM system_logs ORDER BY timestamp DESC LIMIT 100`;

    const tanks = tanksRes.rows.map(r => r.details as Tank);
    const inventory = inventoryRes.rows.map(r => r.details as InventoryItem);
    const recipes = recipesRes.rows.map(r => r.details as Recipe);
    const batches = batchesRes.rows.map(r => r.details as Batch);
    const kegBatches = kegBatchesRes.rows.map(r => r.details as KegBatch);
    const logs = logsRes.rows as LogEntry[];

    return { success: true, data: { tanks, inventory, recipes, batches, kegBatches, logs } };
  } catch (error: any) {
    console.error("Failed to fetch initial state:", error);
    return { success: false, error: error.message };
  }
}

export async function saveLog(log: LogEntry) {
  try {
    await sql`
      INSERT INTO system_logs (id, timestamp, username, action, details) 
      VALUES (${log.id}, ${log.timestamp}, ${log.user}, ${log.action}, ${log.details})
    `;
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save log:", error);
    return { success: false, error: error.message };
  }
}

export async function saveRecipe(recipe: Recipe) {
  try {
    const exists = await sql`SELECT id FROM recipes WHERE details->>'id' = ${recipe.id}`;
    if (exists.rowCount > 0) {
      await sql`UPDATE recipes SET details = ${JSON.stringify(recipe)}::jsonb WHERE details->>'id' = ${recipe.id}`;
    } else {
      await sql`INSERT INTO recipes (name, style, og_target, ph_target, details) VALUES (${recipe.name}, ${recipe.style}, ${recipe.vitals?.originalGravity || 0}, 5.2, ${JSON.stringify(recipe)}::jsonb)`;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save recipe:", error);
    return { success: false, error: error.message };
  }
}

export async function removeRecipe(id: string) {
  try {
    await sql`DELETE FROM recipes WHERE details->>'id' = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete recipe:", error);
    return { success: false };
  }
}

export async function saveInventoryItem(item: InventoryItem) {
  try {
    const exists = await sql`SELECT id FROM materials WHERE name = ${item.name}`;
    if (exists.rowCount > 0) {
      await sql`UPDATE materials SET details = ${JSON.stringify(item)}::jsonb, quantity = ${item.quantity} WHERE name = ${item.name}`;
    } else {
      await sql`INSERT INTO materials (name, unit, quantity, details) VALUES (${item.name}, ${item.unit}, ${item.quantity}, ${JSON.stringify(item)}::jsonb)`;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save inventory:", error);
    return { success: false, error: error.message };
  }
}

export async function removeInventoryItem(id: string) {
  try {
    await sql`DELETE FROM materials WHERE details->>'id' = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete inventory:", error);
    return { success: false };
  }
}

export async function saveTank(tank: Tank) {
  try {
    const exists = await sql`SELECT id FROM tanks WHERE zone = ${tank.zoneId} AND position = ${parseInt(tank.name.slice(-1)) || 1}`;
    if (exists.rowCount > 0) {
      await sql`UPDATE tanks SET details = ${JSON.stringify(tank)}::jsonb WHERE id = ${exists.rows[0].id}`;
    } else {
      await sql`INSERT INTO tanks (zone, position, details) VALUES (${tank.zoneId}, ${parseInt(tank.name.slice(-1)) || 1}, ${JSON.stringify(tank)}::jsonb)`;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save tank:", error);
    return { success: false, error: error.message };
  }
}

export async function saveBatch(batch: Batch) {
  try {
    const exists = await sql`SELECT id FROM brew_batches WHERE details->>'id' = ${batch.id}`;
    if (exists.rowCount > 0) {
      await sql`UPDATE brew_batches SET details = ${JSON.stringify(batch)}::jsonb WHERE id = ${exists.rows[0].id}`;
    } else {
      // Find recipe id to satisfy FK
      const recipe = await sql`SELECT id FROM recipes WHERE details->>'id' = ${batch.recipeId}`;
      const rid = recipe.rowCount > 0 ? recipe.rows[0].id : 1; // Fallback to 1
      
      await sql`INSERT INTO brew_batches (recipe_id, tank_id, volume, brew_date, status, details) VALUES (${rid}, 1, 60, NOW(), 'fermenting', ${JSON.stringify(batch)}::jsonb)`;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save batch:", error);
    return { success: false, error: error.message };
  }
}

export async function removeBatch(id: string) {
  try {
    await sql`DELETE FROM brew_batches WHERE details->>'id' = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete batch:", error);
    return { success: false };
  }
}

export async function saveKegBatch(kegBatch: KegBatch) {
  try {
    const exists = await sql`SELECT id FROM keg_batches WHERE details->>'id' = ${kegBatch.id}`;
    if (exists.rowCount > 0) {
      await sql`UPDATE keg_batches SET details = ${JSON.stringify(kegBatch)}::jsonb WHERE id = ${exists.rows[0].id}`;
    } else {
      await sql`INSERT INTO keg_batches (batch_id, recipe_id, batch_number, total_kegs, available_kegs, details) VALUES (${kegBatch.batchId}, ${kegBatch.recipeId}, ${kegBatch.batchNumber}, ${kegBatch.totalKegs}, ${kegBatch.availableKegs}, ${JSON.stringify(kegBatch)}::jsonb)`;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save keg batch:", error);
    return { success: false, error: error.message };
  }
}

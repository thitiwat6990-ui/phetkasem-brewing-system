import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function wipeDatabase() {
  console.log("⚠️ Starting Database Wipe...");
  console.log("Connecting to Vercel Postgres...\n");

  try {
    console.log("1. Deleting reservations (child of brew_batches)...");
    await sql`DELETE FROM reservations`;

    console.log("2. Deleting recipe_ingredients (child of recipes and materials)...");
    await sql`DELETE FROM recipe_ingredients`;

    console.log("3. Deleting brew_batches (child of recipes)...");
    await sql`DELETE FROM brew_batches`;

    console.log("4. Deleting keg_batches...");
    await sql`DELETE FROM keg_batches`;

    console.log("5. Deleting recipes...");
    await sql`DELETE FROM recipes`;

    console.log("6. Deleting materials...");
    await sql`DELETE FROM materials`;

    console.log("7. Deleting system_logs...");
    await sql`DELETE FROM system_logs`;

    console.log("8. Deleting logs...");
    await sql`DELETE FROM logs`;

    console.log("\n✅ Test data wipe complete!");

    // Verification
    console.log("\n📊 Verification Row Counts:");
    const res = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM tanks) as tanks_count,
        (SELECT COUNT(*) FROM materials) as materials_count,
        (SELECT COUNT(*) FROM recipes) as recipes_count,
        (SELECT COUNT(*) FROM brew_batches) as brew_batches_count,
        (SELECT COUNT(*) FROM keg_batches) as keg_batches_count,
        (SELECT COUNT(*) FROM system_logs) as system_logs_count
    `;
    console.table(res.rows[0]);

  } catch (error) {
    console.error("❌ Error wiping database:", error);
  }
}

wipeDatabase();

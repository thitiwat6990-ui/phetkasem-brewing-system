import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  console.error('Error: POSTGRES_URL environment variable is missing.');
  process.exit(1);
}

async function main() {
  console.log('Adding JSONB columns to tables...');

  try {
    await sql`ALTER TABLE materials ADD COLUMN IF NOT EXISTS details JSONB;`;
    await sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS details JSONB;`;
    await sql`ALTER TABLE tanks ADD COLUMN IF NOT EXISTS details JSONB;`;
    await sql`ALTER TABLE brew_batches ADD COLUMN IF NOT EXISTS details JSONB;`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS keg_batches (
        id SERIAL PRIMARY KEY,
        batch_id VARCHAR(255),
        recipe_id VARCHAR(255),
        batch_number VARCHAR(255),
        total_kegs INTEGER,
        available_kegs INTEGER,
        liters_per_keg REAL,
        price_per_keg REAL,
        shipping_cost REAL,
        date_packaged VARCHAR(255),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id VARCHAR(255) PRIMARY KEY,
        timestamp VARCHAR(255),
        username VARCHAR(255),
        action VARCHAR(255),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('JSONB columns and missing tables added successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();

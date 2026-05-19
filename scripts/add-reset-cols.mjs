import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  console.error('Error: POSTGRES_URL environment variable is missing.');
  console.error('Please add it to your .env.local file or set it in your environment.');
  process.exit(1);
}

async function main() {
  console.log('Adding reset password columns to users table...');

  try {
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
    `;

    console.log('Columns added successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();

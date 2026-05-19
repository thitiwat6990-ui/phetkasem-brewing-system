import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  console.error('Error: POSTGRES_URL environment variable is missing.');
  console.error('Please add it to your .env.local file or set it in your environment.');
  process.exit(1);
}

async function main() {
  console.log('Starting database migration and seeding for Postgres...');

  try {
    // Drop existing tables for a clean seed (optional, but good for prototyping)
    // Be careful with this in production!
    // await sql`DROP TABLE IF EXISTS logs, reservations, brew_batches, tanks, recipe_ingredients, recipes, materials, users CASCADE;`;

    console.log('Creating tables...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        role VARCHAR(50) NOT NULL CHECK(role IN ('Master brewer', 'employee')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS materials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        unit VARCHAR(50) NOT NULL,
        quantity REAL NOT NULL DEFAULT 0,
        min_threshold REAL NOT NULL DEFAULT 0,
        category VARCHAR(50) DEFAULT 'others',
        brand VARCHAR(255),
        sub_type VARCHAR(100),
        ebc REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        style VARCHAR(255) NOT NULL,
        og_target REAL NOT NULL,
        ph_target REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL REFERENCES recipes(id),
        material_id INTEGER NOT NULL REFERENCES materials(id),
        amount_per_liter REAL NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tanks (
        id SERIAL PRIMARY KEY,
        zone INTEGER NOT NULL,
        position INTEGER NOT NULL,
        capacity REAL NOT NULL DEFAULT 60,
        is_active BOOLEAN NOT NULL DEFAULT false,
        UNIQUE(zone, position)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS brew_batches (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL REFERENCES recipes(id),
        tank_id INTEGER NOT NULL REFERENCES tanks(id),
        volume REAL NOT NULL,
        og_actual REAL,
        ph_actual REAL,
        brew_date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL CHECK(status IN ('fermenting', 'cold_crash', 'ready', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        brew_batch_id INTEGER NOT NULL REFERENCES brew_batches(id),
        customer_name VARCHAR(255) NOT NULL,
        quantity REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK(type IN ('stock', 'brew', 'tank')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Tables created. Seeding initial data...');

    // Seed Tanks
    const tanksCheck = await sql`SELECT COUNT(*) as count FROM tanks`;
    if (parseInt(tanksCheck.rows[0].count, 10) === 0) {
      for (let zone = 1; zone <= 4; zone++) {
        for (let position = 1; position <= 3; position++) {
          await sql`INSERT INTO tanks (zone, position) VALUES (${zone}, ${position})`;
        }
      }
      console.log('Tanks seeded.');
    }

    // Seed Materials
    const matsCheck = await sql`SELECT COUNT(*) as count FROM materials`;
    if (parseInt(matsCheck.rows[0].count, 10) === 0) {
      const m1 = await sql`INSERT INTO materials (name, unit, quantity, min_threshold, category, brand, sub_type, ebc) VALUES ('Pale Malt', 'kg', 500, 50, 'malts', 'GLADFIELD', 'BASE', 6) RETURNING id`;
      const m2 = await sql`INSERT INTO materials (name, unit, quantity, min_threshold, category, brand, sub_type) VALUES ('Cascade Hops', 'g', 10000, 1000, 'hops', 'YCH', 'AROMA') RETURNING id`;
      const m3 = await sql`INSERT INTO materials (name, unit, quantity, min_threshold, category, brand, sub_type) VALUES ('US-05 Yeast', 'pkgs', 100, 10, 'yeasts', 'FERMENTIS', 'ALE') RETURNING id`;
      
      const r1 = await sql`INSERT INTO recipes (name, style, og_target, ph_target) VALUES ('Classic Pale Ale', 'Pale Ale', 1.050, 5.2) RETURNING id`;
      
      await sql`INSERT INTO recipe_ingredients (recipe_id, material_id, amount_per_liter) VALUES (${r1.rows[0].id}, ${m1.rows[0].id}, 0.2)`;
      await sql`INSERT INTO recipe_ingredients (recipe_id, material_id, amount_per_liter) VALUES (${r1.rows[0].id}, ${m2.rows[0].id}, 2)`;
      await sql`INSERT INTO recipe_ingredients (recipe_id, material_id, amount_per_liter) VALUES (${r1.rows[0].id}, ${m3.rows[0].id}, 0.05)`;
      
      console.log('Materials and default recipe seeded.');
    }

    // Seed Admin
    const usersCheck = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(usersCheck.rows[0].count, 10) === 0) {
      const hash1 = bcrypt.hashSync('123123', 10);
      await sql`INSERT INTO users (username, password_hash, first_name, last_name, phone, email, role) VALUES ('Sunny', ${hash1}, 'Sunny', 'Admin', '-', 'admin@example.com', 'Master brewer')`;
      
      const hash2 = bcrypt.hashSync('Sunkc53h1', 10);
      await sql`INSERT INTO users (username, password_hash, first_name, last_name, phone, email, role) VALUES ('Thitiwat', ${hash2}, 'Thitiwat', 'Admin', '-', 'thitiwat.6990@gmail.com', 'Master brewer')`;
      
      console.log('Admin users seeded.');
    }

    console.log('Migration and seeding completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();

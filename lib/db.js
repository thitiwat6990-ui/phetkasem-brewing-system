import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'brewery.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'brewer', 'staff')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    min_threshold REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    style TEXT NOT NULL,
    og_target REAL NOT NULL,
    ph_target REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    amount_per_liter REAL NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (material_id) REFERENCES materials(id)
  );

  CREATE TABLE IF NOT EXISTS tanks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone INTEGER NOT NULL,
    position INTEGER NOT NULL,
    capacity REAL NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT 0,
    UNIQUE(zone, position)
  );

  CREATE TABLE IF NOT EXISTS brew_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    tank_id INTEGER NOT NULL,
    volume REAL NOT NULL,
    og_actual REAL,
    ph_actual REAL,
    brew_date DATETIME NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('fermenting', 'cold_crash', 'ready', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (tank_id) REFERENCES tanks(id)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brew_batch_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brew_batch_id) REFERENCES brew_batches(id)
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('stock', 'brew', 'tank')),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Add indexes
  CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
  CREATE INDEX IF NOT EXISTS idx_brew_batches_tank_id ON brew_batches(tank_id);
  CREATE INDEX IF NOT EXISTS idx_brew_batches_brew_date ON brew_batches(brew_date);
`);

// Run migrations for existing DB
const tableInfo = db.pragma('table_info(materials)');
if (!tableInfo.some(col => col.name === 'category')) {
  db.exec(`
    ALTER TABLE materials ADD COLUMN category TEXT DEFAULT 'others';
    ALTER TABLE materials ADD COLUMN brand TEXT;
    ALTER TABLE materials ADD COLUMN sub_type TEXT;
    ALTER TABLE materials ADD COLUMN ebc REAL;
  `);

  db.prepare("UPDATE materials SET category = 'malts', brand = 'GLADFIELD', sub_type = 'BASE', ebc = 6 WHERE name = 'Pale Malt'").run();
  db.prepare("UPDATE materials SET category = 'hops', brand = 'YCH', sub_type = 'AROMA' WHERE name = 'Cascade Hops'").run();
  db.prepare("UPDATE materials SET category = 'yeasts', brand = 'FERMENTIS', sub_type = 'ALE' WHERE name = 'US-05 Yeast'").run();
}

// Seed initial data
const checkTanks = db.prepare('SELECT COUNT(*) as count FROM tanks').get();
if (checkTanks.count === 0) {
  const insertTank = db.prepare('INSERT INTO tanks (zone, position) VALUES (?, ?)');
  const insertTankMany = db.transaction((tanks) => {
    for (const t of tanks) insertTank.run(t.zone, t.position);
  });
  
  const initialTanks = [];
  for (let zone = 1; zone <= 4; zone++) {
    for (let position = 1; position <= 3; position++) {
      initialTanks.push({ zone, position });
    }
  }
  insertTankMany(initialTanks);

  // Seed default materials and recipes to get started
  const insertMaterial = db.prepare('INSERT INTO materials (name, unit, quantity, min_threshold, category, brand, sub_type, ebc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const m1 = insertMaterial.run('Pale Malt', 'kg', 500, 50, 'malts', 'GLADFIELD', 'BASE', 6);
  const m2 = insertMaterial.run('Cascade Hops', 'g', 10000, 1000, 'hops', 'YCH', 'AROMA', null);
  const m3 = insertMaterial.run('US-05 Yeast', 'pkgs', 100, 10, 'yeasts', 'FERMENTIS', 'ALE', null);

  const insertRecipe = db.prepare('INSERT INTO recipes (name, style, og_target, ph_target) VALUES (?, ?, ?, ?)');
  const r1 = insertRecipe.run('Classic Pale Ale', 'Pale Ale', 1.050, 5.2);

  const insertIngredient = db.prepare('INSERT INTO recipe_ingredients (recipe_id, material_id, amount_per_liter) VALUES (?, ?, ?)');
  insertIngredient.run(r1.lastInsertRowid, m1.lastInsertRowid, 0.2); // 200g per liter (12kg for 60L)
  insertIngredient.run(r1.lastInsertRowid, m2.lastInsertRowid, 2);   // 2g per liter (120g for 60L)
  insertIngredient.run(r1.lastInsertRowid, m3.lastInsertRowid, 0.05); // 0.05 pkg per liter (3 pkgs for 60L)
}

// Seed default admin user
const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (checkUsers.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  const hash = bcrypt.hashSync('admin123', 10);
  insertUser.run('admin', hash, 'admin');
}

export default db;

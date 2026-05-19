require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkSchema() {
  try {
    const res = await sql`
      SELECT tc.table_name, kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY';
    `;
    console.log("Foreign Keys:", res.rows);
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log("Tables:", tables.rows.map(r => r.table_name));
  } catch(e) {
    console.error(e);
  }
}
checkSchema();

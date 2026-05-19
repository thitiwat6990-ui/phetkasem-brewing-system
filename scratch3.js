require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
async function run() {
  try {
    const res = await sql`SELECT COUNT(*) FROM logs`;
    console.log("Logs count:", res.rows[0]);
  } catch(e) {
    console.error(e);
  }
}
run();

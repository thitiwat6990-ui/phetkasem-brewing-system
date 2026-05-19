require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkRows() {
  try {
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
    console.log(res.rows[0]);
  } catch(e) {
    console.error(e);
  }
}
checkRows();

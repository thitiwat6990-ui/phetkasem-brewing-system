const db = require('./lib/db');
const bcrypt = require('bcryptjs');
try {
  const hash = bcrypt.hashSync('123123', 10);
  const insert = db.prepare('INSERT INTO users (username, password_hash, first_name, last_name, phone, email, role) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const result = insert.run('testuser', hash, 'Test', 'User', '0123456789', 'test@test.com', 'employee');
  console.log('Success:', result);
} catch (e) {
  console.error('Error:', e);
}

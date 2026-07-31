const db = require('./db');
const { hashPassword } = require('./auth');

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error('Uso: node server/create-admin.js <usuario> <contraseña>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres.');
  process.exit(1);
}

const passwordHash = hashPassword(password);

const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
if (existing) {
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(passwordHash, username);
  console.log(`Contraseña actualizada para "${username}".`);
} else {
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
  console.log(`Usuario admin "${username}" creado.`);
}

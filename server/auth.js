const bcrypt = require('bcryptjs');
const db = require('./db');

function findByUsername(username) {
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

module.exports = { findByUsername, verifyPassword, hashPassword, requireAuth };

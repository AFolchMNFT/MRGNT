const admin = require('firebase-admin');

function resolveRole(claims) {
  if (claims.role === 'admin' || claims.role === 'writer') return claims.role;
  if (claims.admin) return 'admin';
  return null;
}

async function decodeToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

// Any authenticated account (writer or admin).
async function requireAuth(req, res, next) {
  const decoded = await decodeToken(req);
  const role = decoded && resolveRole(decoded);
  if (!role) return res.status(401).json({ error: 'No autenticado' });
  req.user = decoded;
  req.role = role;
  next();
}

// Admin accounts only.
async function requireAdmin(req, res, next) {
  const decoded = await decodeToken(req);
  const role = decoded && resolveRole(decoded);
  if (role !== 'admin') return res.status(401).json({ error: 'No autenticado' });
  req.user = decoded;
  req.role = role;
  next();
}

module.exports = { requireAuth, requireAdmin, resolveRole, decodeToken };

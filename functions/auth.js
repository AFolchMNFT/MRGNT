const admin = require('firebase-admin');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.admin) return res.status(401).json({ error: 'No autenticado' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'No autenticado' });
  }
}

module.exports = { requireAuth };

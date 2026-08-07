const express = require('express');
const admin = require('firebase-admin');
const { requireAdmin, resolveRole } = require('../auth');

const router = express.Router();

const VALID_ROLES = ['admin', 'writer'];

function toClient(userRecord) {
  return {
    uid: userRecord.uid,
    email: userRecord.email,
    role: resolveRole(userRecord.customClaims || {}),
    createdAt: userRecord.metadata.creationTime,
  };
}

router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = [];
    let pageToken;
    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      users.push(...result.users);
      pageToken = result.pageToken;
    } while (pageToken);
    res.json(
      users
        .map(toClient)
        .filter((u) => u.role)
        .sort((a, b) => a.email.localeCompare(b.email))
    );
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !email.trim()) return res.status(400).json({ error: 'El correo es requerido' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Rol inválido' });

  try {
    const userRecord = await admin.auth().createUser({ email: email.trim(), password });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role, admin: role === 'admin' });
    const updated = await admin.auth().getUser(userRecord.uid);
    res.status(201).json(toClient(updated));
  } catch (err) {
    if (err.code === 'auth/email-already-exists') return res.status(400).json({ error: 'Ya existe una cuenta con ese correo' });
    if (err.code === 'auth/invalid-email') return res.status(400).json({ error: 'Correo inválido' });
    res.status(500).json({ error: err.message || 'Error al crear usuario' });
  }
});

router.put('/:uid/role', requireAdmin, async (req, res) => {
  const { role } = req.body || {};
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Rol inválido' });
  if (req.params.uid === req.user.uid) return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });

  try {
    await admin.auth().setCustomUserClaims(req.params.uid, { role, admin: role === 'admin' });
    const updated = await admin.auth().getUser(req.params.uid);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al actualizar usuario' });
  }
});

router.delete('/:uid', requireAdmin, async (req, res) => {
  if (req.params.uid === req.user.uid) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  try {
    await admin.auth().deleteUser(req.params.uid);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al eliminar usuario' });
  }
});

module.exports = router;

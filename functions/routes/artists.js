const express = require('express');
const admin = require('firebase-admin');
const { requireAuth } = require('../auth');
const { DISCIPLINES } = require('../constants');

const router = express.Router();

function toClient(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    name: d.name,
    discipline: d.discipline,
    genre: d.genre,
    featured: d.featured === true,
  };
}

function validate(body) {
  if (!body.name || !body.name.trim()) return 'El nombre es requerido';
  if (!DISCIPLINES.includes(body.discipline)) return 'Disciplina inválida';
  return null;
}

router.get('/', async (req, res) => {
  try {
    const snap = await admin.firestore().collection('artists').orderBy('createdAt').get();
    res.json(snap.docs.map(toClient));
  } catch {
    res.status(500).json({ error: 'Error al obtener artistas' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { name, discipline, genre = '', featured = false } = req.body;
  try {
    const ref = await admin.firestore().collection('artists').add({
      name: name.trim(),
      discipline,
      genre,
      featured: featured === true || featured === 'true',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const snap = await ref.get();
    res.status(201).json(toClient(snap));
  } catch {
    res.status(500).json({ error: 'Error al crear artista' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const ref = admin.firestore().collection('artists').doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'No encontrado' });
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { name, discipline, genre = '', featured = false } = req.body;
  try {
    await ref.update({
      name: name.trim(),
      discipline,
      genre,
      featured: featured === true || featured === 'true',
    });
    const updated = await ref.get();
    res.json(toClient(updated));
  } catch {
    res.status(500).json({ error: 'Error al actualizar artista' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const ref = admin.firestore().collection('artists').doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'No encontrado' });
  try {
    await ref.delete();
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Error al eliminar artista' });
  }
});

module.exports = router;

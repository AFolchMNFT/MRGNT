const express = require('express');
const admin = require('firebase-admin');
const { requireAuth } = require('../auth');
const { isoToDisplay, dayAbbrev } = require('../lib/dateFormat');

const router = express.Router();

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toClient(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    event_date: d.event_date,
    date: isoToDisplay(d.event_date),
    day: dayAbbrev(d.event_date),
    time: d.time,
    stage: d.stage,
    artist: d.artist,
    tag: d.tag,
  };
}

function validate(body) {
  if (!body.event_date || !ISO_DATE_RE.test(body.event_date)) return 'Fecha inválida (usa el selector de fecha)';
  if (!body.time || !body.time.trim()) return 'La hora es requerida';
  if (!body.stage || !body.stage.trim()) return 'El escenario es requerido';
  if (!body.artist || !body.artist.trim()) return 'El artista/acto es requerido';
  return null;
}

router.get('/', async (req, res) => {
  try {
    const snap = await admin.firestore().collection('events').orderBy('event_date').get();
    res.json(snap.docs.map(toClient));
  } catch {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { event_date, time, stage, artist, tag = '' } = req.body;
  try {
    const ref = await admin.firestore().collection('events').add({
      event_date,
      time: time.trim(),
      stage: stage.trim(),
      artist: artist.trim(),
      tag,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const snap = await ref.get();
    res.status(201).json(toClient(snap));
  } catch {
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const ref = admin.firestore().collection('events').doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'No encontrado' });
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { event_date, time, stage, artist, tag = '' } = req.body;
  try {
    await ref.update({ event_date, time: time.trim(), stage: stage.trim(), artist: artist.trim(), tag });
    const updated = await ref.get();
    res.json(toClient(updated));
  } catch {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const ref = admin.firestore().collection('events').doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'No encontrado' });
  try {
    await ref.delete();
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

module.exports = router;

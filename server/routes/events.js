const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { isoToDisplay, dayAbbrev } = require('../lib/dateFormat');

const router = express.Router();

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toClient(row) {
  return {
    id: row.id,
    event_date: row.event_date,
    date: isoToDisplay(row.event_date),
    day: dayAbbrev(row.event_date),
    time: row.time,
    stage: row.stage,
    artist: row.artist,
    tag: row.tag,
  };
}

function validate(body) {
  if (!body.event_date || !ISO_DATE_RE.test(body.event_date)) return 'Fecha inválida (usa el selector de fecha)';
  if (!body.time || !body.time.trim()) return 'La hora es requerida';
  if (!body.stage || !body.stage.trim()) return 'El escenario es requerido';
  if (!body.artist || !body.artist.trim()) return 'El artista/acto es requerido';
  return null;
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY event_date').all();
  res.json(rows.map(toClient));
});

router.post('/', requireAuth, (req, res) => {
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { event_date, time, stage, artist, tag = '' } = req.body;
  const info = db
    .prepare('INSERT INTO events (event_date, time, stage, artist, tag) VALUES (?, ?, ?, ?, ?)')
    .run(event_date, time.trim(), stage.trim(), artist.trim(), tag);
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toClient(row));
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { event_date, time, stage, artist, tag = '' } = req.body;
  db.prepare('UPDATE events SET event_date = ?, time = ?, stage = ?, artist = ?, tag = ? WHERE id = ?')
    .run(event_date, time.trim(), stage.trim(), artist.trim(), tag, req.params.id);
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(toClient(row));
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;

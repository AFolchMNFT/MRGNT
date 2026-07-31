const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { DISCIPLINES } = require('../constants');

const router = express.Router();

function toClient(row) {
  return {
    id: row.id,
    name: row.name,
    discipline: row.discipline,
    genre: row.genre,
    featured: !!row.featured,
  };
}

function validate(body) {
  if (!body.name || !body.name.trim()) return 'El nombre es requerido';
  if (!DISCIPLINES.includes(body.discipline)) return 'Disciplina inválida';
  return null;
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM artists ORDER BY id').all();
  res.json(rows.map(toClient));
});

router.post('/', requireAuth, (req, res) => {
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { name, discipline, genre = '', featured = false } = req.body;
  const info = db
    .prepare('INSERT INTO artists (name, discipline, genre, featured) VALUES (?, ?, ?, ?)')
    .run(name.trim(), discipline, genre, featured ? 1 : 0);
  const row = db.prepare('SELECT * FROM artists WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toClient(row));
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { name, discipline, genre = '', featured = false } = req.body;
  db.prepare('UPDATE artists SET name = ?, discipline = ?, genre = ?, featured = ? WHERE id = ?')
    .run(name.trim(), discipline, genre, featured ? 1 : 0, req.params.id);
  const row = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  res.json(toClient(row));
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  db.prepare('DELETE FROM artists WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;

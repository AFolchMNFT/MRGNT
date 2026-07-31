const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { NOTICIAS_CATEGORIES } = require('../constants');
const { isoToDisplay } = require('../lib/dateFormat');
const { upload, mediaTypeFor, deleteMediaFile } = require('../uploads');

const router = express.Router();

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function handleMediaUpload(req, res, next) {
  upload.single('media')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

function toClient(row) {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    article_date: row.article_date,
    date: isoToDisplay(row.article_date),
    author: row.author,
    excerpt: row.excerpt,
    note: row.note,
    media: row.media_path,
    mediaType: row.media_type,
  };
}

function normalizeNote(note) {
  return note.replace(/\r\n/g, '\n').trim();
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function uniqueSlug(base, ignoreId) {
  let slug = base || 'articulo';
  let n = 2;
  const existsStmt = ignoreId
    ? db.prepare('SELECT id FROM articles WHERE slug = ? AND id != ?')
    : db.prepare('SELECT id FROM articles WHERE slug = ?');
  while (ignoreId ? existsStmt.get(slug, ignoreId) : existsStmt.get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function validate(body) {
  if (!body.title || !body.title.trim()) return 'El título es requerido';
  if (!NOTICIAS_CATEGORIES.includes(body.category)) return 'Categoría inválida';
  if (!body.article_date || !ISO_DATE_RE.test(body.article_date)) return 'Fecha inválida (usa el selector de fecha)';
  if (!body.author || !body.author.trim()) return 'El autor es requerido';
  if (!body.excerpt || !body.excerpt.trim()) return 'El resumen es requerido';
  if (!body.note || !body.note.trim()) return 'La nota es requerida';
  return null;
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM articles ORDER BY article_date DESC').all();
  res.json(rows.map(toClient));
});

router.post('/', requireAuth, handleMediaUpload, (req, res) => {
  const error = validate(req.body || {});
  if (error) {
    if (req.file) deleteMediaFile(`/uploads/${req.file.filename}`);
    return res.status(400).json({ error });
  }
  const { title, category, article_date, author, excerpt, note } = req.body;
  const slug = uniqueSlug(slugify(req.body.slug && req.body.slug.trim() ? req.body.slug : title));
  const mediaPath = req.file ? `/uploads/${req.file.filename}` : null;
  const mediaType = req.file ? mediaTypeFor(req.file.mimetype) : null;
  const info = db
    .prepare(
      'INSERT INTO articles (slug, category, title, article_date, author, excerpt, note, media_path, media_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(slug, category, title.trim(), article_date, author.trim(), excerpt.trim(), normalizeNote(note), mediaPath, mediaType);
  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toClient(row));
});

router.put('/:id', requireAuth, handleMediaUpload, (req, res) => {
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!existing) {
    if (req.file) deleteMediaFile(`/uploads/${req.file.filename}`);
    return res.status(404).json({ error: 'No encontrado' });
  }
  const error = validate(req.body || {});
  if (error) {
    if (req.file) deleteMediaFile(`/uploads/${req.file.filename}`);
    return res.status(400).json({ error });
  }
  const { title, category, article_date, author, excerpt, note } = req.body;
  const baseSlug = req.body.slug && req.body.slug.trim() ? slugify(req.body.slug) : existing.slug;
  const slug = uniqueSlug(baseSlug, existing.id);

  let mediaPath = existing.media_path;
  let mediaType = existing.media_type;
  if (req.file) {
    deleteMediaFile(existing.media_path);
    mediaPath = `/uploads/${req.file.filename}`;
    mediaType = mediaTypeFor(req.file.mimetype);
  } else if (req.body.remove_media === 'true') {
    deleteMediaFile(existing.media_path);
    mediaPath = null;
    mediaType = null;
  }

  db.prepare(
    'UPDATE articles SET slug = ?, category = ?, title = ?, article_date = ?, author = ?, excerpt = ?, note = ?, media_path = ?, media_type = ? WHERE id = ?'
  ).run(slug, category, title.trim(), article_date, author.trim(), excerpt.trim(), normalizeNote(note), mediaPath, mediaType, req.params.id);
  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  res.json(toClient(row));
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  deleteMediaFile(existing.media_path);
  res.status(204).end();
});

module.exports = router;

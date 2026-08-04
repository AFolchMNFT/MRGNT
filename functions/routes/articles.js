const express = require('express');
const admin = require('firebase-admin');
const { requireAuth } = require('../auth');
const { NOTICIAS_CATEGORIES } = require('../constants');
const { isoToDisplay } = require('../lib/dateFormat');
const { deleteMediaFile } = require('../storage');
const { slugify } = require('../lib/slugify');
const { sanitizeRichText } = require('../lib/sanitize');
const { detectEmbedProvider } = require('../lib/embeds');

const router = express.Router();

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toClient(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    slug: doc.id,
    category: d.category,
    title: d.title,
    article_date: d.article_date,
    date: isoToDisplay(d.article_date),
    author: d.author,
    excerpt: d.excerpt,
    note: d.note,
    media: d.media || null,
    mediaType: d.media_type || null,
    embedUrl: d.embed_url || null,
    embedProvider: d.embed_provider || null,
  };
}

function normalizeNote(note) {
  return sanitizeRichText(note.replace(/\r\n/g, '\n').trim());
}

function validate(body) {
  if (!body.title || !body.title.trim()) return 'El título es requerido';
  if (!NOTICIAS_CATEGORIES.includes(body.category)) return 'Categoría inválida';
  if (!body.article_date || !ISO_DATE_RE.test(body.article_date)) return 'Fecha inválida (usa el selector de fecha)';
  if (!body.author || !body.author.trim()) return 'El autor es requerido';
  if (!body.excerpt || !body.excerpt.trim()) return 'El resumen es requerido';
  if (!body.note || !body.note.trim()) return 'La nota es requerida';
  if (body.embed_url && body.embed_url.trim() && !detectEmbedProvider(body.embed_url.trim())) {
    return 'Enlace de embed no reconocido (usa YouTube, Instagram, TikTok o X/Twitter)';
  }
  return null;
}

router.get('/', async (req, res) => {
  try {
    const snap = await admin.firestore().collection('articles').orderBy('article_date', 'desc').get();
    res.json(snap.docs.map(toClient));
  } catch {
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  const { title, category, article_date, author, excerpt, note, media, media_path, media_type } = req.body;
  const rawSlug = req.body.slug && req.body.slug.trim() ? req.body.slug.trim() : title;
  const baseSlug = slugify(rawSlug) || 'articulo';
  const embedUrl = req.body.embed_url && req.body.embed_url.trim() ? req.body.embed_url.trim() : null;
  const embedProvider = embedUrl ? detectEmbedProvider(embedUrl) : null;

  const docData = {
    category,
    title: title.trim(),
    article_date,
    author: author.trim(),
    excerpt: excerpt.trim(),
    note: normalizeNote(note),
    media: media || null,
    media_path: media_path || null,
    media_type: media_type || null,
    embed_url: embedUrl,
    embed_provider: embedProvider,
  };

  const col = admin.firestore().collection('articles');
  let finalRef = null;
  let slug = baseSlug;

  try {
    await admin.firestore().runTransaction(async (tx) => {
      let n = 2;
      for (let attempt = 0; attempt < 20; attempt++) {
        const ref = col.doc(slug);
        const snap = await tx.get(ref);
        if (!snap.exists) {
          tx.set(ref, docData);
          finalRef = ref;
          return;
        }
        slug = `${baseSlug}-${n++}`;
      }
      throw new Error('No se pudo generar slug único');
    });

    const newSnap = await finalRef.get();
    res.status(201).json(toClient(newSnap));
  } catch (err) {
    if (media_path) await deleteMediaFile(media_path).catch(() => {});
    res.status(500).json({ error: err.message || 'Error al crear artículo' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const oldId = req.params.id;
  const col = admin.firestore().collection('articles');
  const oldRef = col.doc(oldId);

  const oldSnap = await oldRef.get();
  if (!oldSnap.exists) return res.status(404).json({ error: 'No encontrado' });

  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  const { title, category, article_date, author, excerpt, note } = req.body;
  const existing = oldSnap.data();

  let media = existing.media;
  let mediaPath = existing.media_path;
  let mediaType = existing.media_type;

  if (req.body.media) {
    const oldPath = existing.media_path;
    media = req.body.media;
    mediaPath = req.body.media_path || null;
    mediaType = req.body.media_type || null;
    if (oldPath) await deleteMediaFile(oldPath).catch(() => {});
  } else if (req.body.remove_media === true) {
    if (existing.media_path) await deleteMediaFile(existing.media_path).catch(() => {});
    media = null;
    mediaPath = null;
    mediaType = null;
  }

  let embedUrl = existing.embed_url || null;
  let embedProvider = existing.embed_provider || null;

  if (req.body.embed_url && req.body.embed_url.trim()) {
    embedUrl = req.body.embed_url.trim();
    embedProvider = detectEmbedProvider(embedUrl);
  } else if (req.body.remove_embed === true) {
    embedUrl = null;
    embedProvider = null;
  }

  const rawSlug = req.body.slug && req.body.slug.trim() ? req.body.slug.trim() : null;
  const newBaseSlug = rawSlug ? slugify(rawSlug) : oldId;

  const docData = {
    category,
    title: title.trim(),
    article_date,
    author: author.trim(),
    excerpt: excerpt.trim(),
    note: normalizeNote(note),
    media,
    media_path: mediaPath,
    media_type: mediaType,
    embed_url: embedUrl,
    embed_provider: embedProvider,
  };

  try {
    let finalRef = null;

    if (newBaseSlug === oldId) {
      await oldRef.update(docData);
      finalRef = oldRef;
    } else {
      let slug = newBaseSlug;
      await admin.firestore().runTransaction(async (tx) => {
        let n = 2;
        for (let attempt = 0; attempt < 20; attempt++) {
          const newRef = col.doc(slug);
          const snap = await tx.get(newRef);
          if (!snap.exists) {
            tx.delete(oldRef);
            tx.set(newRef, docData);
            finalRef = newRef;
            return;
          }
          slug = `${newBaseSlug}-${n++}`;
        }
        throw new Error('No se pudo generar slug único');
      });
    }

    const updatedSnap = await finalRef.get();
    res.json(toClient(updatedSnap));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al actualizar artículo' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ref = admin.firestore().collection('articles').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'No encontrado' });
    const data = snap.data();
    await ref.delete();
    if (data.media_path) await deleteMediaFile(data.media_path).catch(() => {});
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Error al eliminar artículo' });
  }
});

module.exports = router;

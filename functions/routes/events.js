const express = require('express');
const admin = require('firebase-admin');
const { requireAuth } = require('../auth');
const { isoToDisplay, dayAbbrev } = require('../lib/dateFormat');
const { slugify } = require('../lib/slugify');
const { sanitizeRichText } = require('../lib/sanitize');

const router = express.Router();

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toClient(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    slug: d.slug || null,
    event_date: d.event_date,
    date: isoToDisplay(d.event_date),
    day: dayAbbrev(d.event_date),
    time: d.time,
    stage: d.stage,
    artist: d.artist,
    tag: d.tag,
    title: d.title || null,
    displayTitle: d.title || d.artist,
    description: d.description || null,
    cost: d.cost || null,
    ticket_link: d.ticket_link || null,
  };
}

function validate(body) {
  if (!body.event_date || !ISO_DATE_RE.test(body.event_date)) return 'Fecha inválida (usa el selector de fecha)';
  if (!body.time || !body.time.trim()) return 'La hora es requerida';
  if (!body.stage || !body.stage.trim()) return 'El escenario es requerido';
  if (!body.artist || !body.artist.trim()) return 'El artista/acto es requerido';
  if (body.ticket_link && body.ticket_link.trim()) {
    try {
      const u = new URL(body.ticket_link.trim());
      if (!/^https?:$/.test(u.protocol)) return 'El enlace de boletos debe ser http o https';
    } catch {
      return 'El enlace de boletos no es válido';
    }
  }
  return null;
}

function buildDocData(body) {
  const { event_date, time, stage, artist, tag = '', title = '', description = '', cost = '', ticket_link = '' } = body;
  return {
    event_date,
    time: time.trim(),
    stage: stage.trim(),
    artist: artist.trim(),
    tag,
    title: title.trim() || null,
    description: sanitizeRichText(description),
    cost: cost.trim() || null,
    ticket_link: ticket_link.trim() || null,
  };
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

  const docData = buildDocData(req.body);
  const baseSlug = slugify(docData.title || docData.artist) || 'evento';
  const col = admin.firestore().collection('events');

  try {
    let finalRef = null;
    await admin.firestore().runTransaction(async (tx) => {
      let slug = baseSlug;
      let n = 2;
      for (let attempt = 0; attempt < 20; attempt++) {
        const snap = await tx.get(col.where('slug', '==', slug));
        if (snap.empty) {
          const ref = col.doc();
          tx.set(ref, { ...docData, slug, createdAt: admin.firestore.FieldValue.serverTimestamp() });
          finalRef = ref;
          return;
        }
        slug = `${baseSlug}-${n++}`;
      }
      throw new Error('No se pudo generar slug único');
    });
    const snap = await finalRef.get();
    res.status(201).json(toClient(snap));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al crear evento' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const ref = admin.firestore().collection('events').doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'No encontrado' });

  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  const docData = buildDocData(req.body);
  const existing = snap.data();

  try {
    if (existing.slug) {
      await ref.update(docData);
    } else {
      const baseSlug = slugify(docData.title || docData.artist) || 'evento';
      const col = admin.firestore().collection('events');
      await admin.firestore().runTransaction(async (tx) => {
        let slug = baseSlug;
        let n = 2;
        for (let attempt = 0; attempt < 20; attempt++) {
          const qSnap = await tx.get(col.where('slug', '==', slug));
          const collision = qSnap.docs.some((d) => d.id !== ref.id);
          if (!collision) {
            tx.update(ref, { ...docData, slug });
            return;
          }
          slug = `${baseSlug}-${n++}`;
        }
        throw new Error('No se pudo generar slug único');
      });
    }
    const updated = await ref.get();
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al actualizar evento' });
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

const express = require('express');
const admin = require('firebase-admin');
const { requireAuth } = require('../auth');
const { DISCIPLINES } = require('../constants');
const { sanitizeRichText } = require('../lib/sanitize');

const router = express.Router();

const SPOTIFY_ID_RE = /^[a-zA-Z0-9]{22}$/;
const SPOTIFY_ARTIST_HOSTS = ['open.spotify.com', 'spotify.link'];

function normalizeSpotifyId(input) {
  if (!input || !input.trim()) return { id: null, error: null };
  const trimmed = input.trim();
  if (SPOTIFY_ID_RE.test(trimmed)) return { id: trimmed, error: null };
  try {
    const u = new URL(trimmed);
    if (SPOTIFY_ARTIST_HOSTS.includes(u.hostname)) {
      const match = u.pathname.match(/^\/artist\/([a-zA-Z0-9]{22})/);
      if (match) return { id: match[1], error: null };
    }
  } catch {
    // not a valid URL either — fall through to error below
  }
  return { id: null, error: 'ID o URL de Spotify inválido' };
}

function toClient(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    name: d.name,
    discipline: d.discipline,
    genre: d.genre,
    featured: d.featured === true,
    bio: d.bio || null,
    spotifyArtistId: d.spotify_artist_id || null,
    showSpotifyEmbed: d.show_spotify_embed === true,
  };
}

function validate(body) {
  if (!body.name || !body.name.trim()) return 'El nombre es requerido';
  if (!DISCIPLINES.includes(body.discipline)) return 'Disciplina inválida';
  const spotifyCheck = normalizeSpotifyId(body.spotify_artist_id);
  if (spotifyCheck.error) return spotifyCheck.error;
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
  const { name, discipline, genre = '', featured = false, bio = '' } = req.body;
  const { id: spotifyArtistId } = normalizeSpotifyId(req.body.spotify_artist_id);
  try {
    const ref = await admin.firestore().collection('artists').add({
      name: name.trim(),
      discipline,
      genre,
      featured: featured === true || featured === 'true',
      bio: sanitizeRichText(bio),
      spotify_artist_id: spotifyArtistId,
      show_spotify_embed: (req.body.show_spotify_embed === true || req.body.show_spotify_embed === 'true') && !!spotifyArtistId,
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
  const { name, discipline, genre = '', featured = false, bio = '' } = req.body;
  const { id: spotifyArtistId } = normalizeSpotifyId(req.body.spotify_artist_id);
  try {
    await ref.update({
      name: name.trim(),
      discipline,
      genre,
      featured: featured === true || featured === 'true',
      bio: sanitizeRichText(bio),
      spotify_artist_id: spotifyArtistId,
      show_spotify_embed: (req.body.show_spotify_embed === true || req.body.show_spotify_embed === 'true') && !!spotifyArtistId,
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

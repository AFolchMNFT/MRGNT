const express = require('express');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../secrets');

const router = express.Router();

const SPOTIFY_ID_RE = /^[a-zA-Z0-9]{22}$/;
const TOKEN_SAFETY_MARGIN_MS = 60 * 1000;
const ARTIST_CACHE_TTL_MS = 60 * 60 * 1000;

let tokenCache = { value: null, expiresAt: 0 };
const artistCache = new Map();
const topTracksCache = new Map();

async function getAppToken(clientId, clientSecret) {
  if (tokenCache.value && Date.now() < tokenCache.expiresAt) return tokenCache.value;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('No se pudo autenticar con Spotify');
  const data = await res.json();
  tokenCache = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - TOKEN_SAFETY_MARGIN_MS,
  };
  return tokenCache.value;
}

router.get('/artist/:id', async (req, res) => {
  const { id } = req.params;
  if (!SPOTIFY_ID_RE.test(id)) return res.status(400).json({ error: 'ID de Spotify inválido' });

  const clientId = SPOTIFY_CLIENT_ID.value();
  const clientSecret = SPOTIFY_CLIENT_SECRET.value();
  if (!clientId || !clientSecret) return res.status(503).json({ error: 'Spotify no configurado' });

  const cached = artistCache.get(id);
  if (cached && Date.now() < cached.expiresAt) return res.json(cached.data);

  try {
    const token = await getAppToken(clientId, clientSecret);
    const spotifyRes = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!spotifyRes.ok) {
      return res.status(spotifyRes.status === 404 ? 404 : 502).json({ error: 'No se pudo obtener el artista de Spotify' });
    }
    const artist = await spotifyRes.json();
    const data = {
      id: artist.id,
      name: artist.name,
      images: artist.images || [],
      genres: artist.genres || [],
      followers: artist.followers ? artist.followers.total : null,
      external_url: artist.external_urls ? artist.external_urls.spotify : null,
    };
    artistCache.set(id, { data, expiresAt: Date.now() + ARTIST_CACHE_TTL_MS });
    res.json(data);
  } catch {
    res.status(502).json({ error: 'Error al conectar con Spotify' });
  }
});

router.get('/artist/:id/top-tracks', async (req, res) => {
  const { id } = req.params;
  if (!SPOTIFY_ID_RE.test(id)) return res.status(400).json({ error: 'ID de Spotify inválido' });

  const clientId = SPOTIFY_CLIENT_ID.value();
  const clientSecret = SPOTIFY_CLIENT_SECRET.value();
  if (!clientId || !clientSecret) return res.status(503).json({ error: 'Spotify no configurado' });

  const cached = topTracksCache.get(id);
  if (cached && Date.now() < cached.expiresAt) return res.json(cached.data);

  try {
    const token = await getAppToken(clientId, clientSecret);
    const spotifyRes = await fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=MX`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!spotifyRes.ok) {
      return res.status(spotifyRes.status === 404 ? 404 : 502).json({ error: 'No se pudieron obtener las canciones de Spotify' });
    }
    const body = await spotifyRes.json();
    const data = (body.tracks || []).slice(0, 5).map((t) => ({
      id: t.id,
      name: t.name,
      preview_url: t.preview_url || null,
      album_image: t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : null,
      external_url: t.external_urls ? t.external_urls.spotify : null,
      duration_ms: t.duration_ms,
    }));
    topTracksCache.set(id, { data, expiresAt: Date.now() + ARTIST_CACHE_TTL_MS });
    res.json(data);
  } catch {
    res.status(502).json({ error: 'Error al conectar con Spotify' });
  }
});

module.exports = router;

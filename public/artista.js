const PREVIEW_STORAGE_KEY = 'mrgnt_artist_preview';

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function isPreviewMode() {
  return getParam('preview') === '1';
}

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function renderNotFound() {
  document.getElementById('artista-title').textContent = 'Artista no encontrado';
  document.getElementById('artista-meta').textContent = '';
  document.getElementById('artista-body').innerHTML = '<p>Este artista no existe o fue eliminado.</p>';
}

function renderTracks(tracks) {
  const wrapEl = document.getElementById('artista-tracks');
  const listEl = document.getElementById('artista-tracks-list');
  if (!tracks || !tracks.length) {
    wrapEl.hidden = true;
    return;
  }
  listEl.innerHTML = '';
  tracks.forEach((track) => {
    const row = document.createElement(track.external_url ? 'a' : 'div');
    row.className = 'artista-track';
    if (track.external_url) {
      row.href = track.external_url;
      row.target = '_blank';
      row.rel = 'noopener';
    }
    row.innerHTML = `
      ${track.album_image ? `<img class="artista-track-art" src="${track.album_image}" alt="" loading="lazy">` : '<span class="artista-track-art artista-track-art-placeholder"></span>'}
      <span class="artista-track-name">${track.name}</span>
      <span class="artista-track-duration">${formatDuration(track.duration_ms)}</span>
    `;
    listEl.appendChild(row);
  });
  wrapEl.hidden = false;
}

function loadSpotifyExtras(spotifyArtistId, showSpotifyEmbed) {
  fetch(`/api/spotify/artist/${spotifyArtistId}`)
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((data) => {
      const imageUrl = data.images && data.images[0] ? data.images[0].url : null;
      if (imageUrl) {
        const imageEl = document.getElementById('artista-hero-image');
        imageEl.innerHTML = `<img src="${imageUrl}" alt="">`;
        imageEl.hidden = false;
      }
    })
    .catch(() => {
      // No Spotify data available — keep the placeholder hidden.
    });

  if (showSpotifyEmbed) {
    const embedWrap = document.getElementById('artista-spotify-embed');
    embedWrap.innerHTML = `<iframe src="https://open.spotify.com/embed/artist/${spotifyArtistId}" width="100%" height="152" style="border:0" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    embedWrap.hidden = false;
  }

  fetch(`/api/spotify/artist/${spotifyArtistId}/top-tracks`)
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then(renderTracks)
    .catch(() => {
      // No track data available — leave the section hidden.
    });
}

function renderArtista(artist) {
  document.title = `${artist.name} — MRGNT`;
  document.getElementById('artista-title').textContent = artist.name;
  document.getElementById('artista-meta').textContent = `${artist.discipline}${artist.genre ? ' — ' + artist.genre : ''}`;
  document.getElementById('artista-featured').hidden = !artist.featured;
  document.getElementById('artista-body').innerHTML = artist.bio || '';

  if (artist.spotifyArtistId) {
    loadSpotifyExtras(artist.spotifyArtistId, artist.showSpotifyEmbed);
  }
}

if (isPreviewMode()) {
  const raw = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
  if (raw) {
    try {
      renderArtista(JSON.parse(raw));
    } catch {
      renderNotFound();
    }
  } else {
    renderNotFound();
  }
} else {
  fetch('/api/artists')
    .then((res) => res.json())
    .then((artists) => {
      const artist = artists.find((a) => a.slug === getParam('slug'));
      if (!artist) return renderNotFound();
      renderArtista(artist);
    });
}

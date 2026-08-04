const ALL_TAB = '__all__';

let artistasTab = ALL_TAB;
let allArtists = [];

function renderTabs(container, tabs, active, onSelect) {
  container.innerHTML = '';
  tabs.forEach((t) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (t === active ? ' active' : '');
    btn.textContent = t === ALL_TAB ? 'Todos' : t;
    btn.addEventListener('click', () => onSelect(t));
    container.appendChild(btn);
  });
}

function renderArtistCard(artist) {
  const card = document.createElement(artist.slug ? 'a' : 'div');
  card.className = 'artist-card';
  if (artist.slug) {
    card.classList.add('artist-card-link');
    card.href = `artista.html?slug=${encodeURIComponent(artist.slug)}`;
  }
  card.innerHTML = `
    <div class="artist-image"></div>
    <div class="artist-body">
      ${artist.featured ? '<span class="artist-featured">Featured</span>' : ''}
      <h4 class="artist-name">${artist.name}</h4>
      <span class="artist-genre">${artist.genre}</span>
      ${artist.slug ? '<span class="artist-card-hint">Ver perfil →</span>' : ''}
    </div>
  `;

  if (artist.spotifyArtistId) {
    fetch(`/api/spotify/artist/${artist.spotifyArtistId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const imageUrl = data.images && data.images[0] ? data.images[0].url : null;
        if (imageUrl) {
          const imageEl = card.querySelector('.artist-image');
          imageEl.innerHTML = '';
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = artist.name;
          img.loading = 'lazy';
          imageEl.appendChild(img);
        }
      })
      .catch(() => {
        // No Spotify data available (not configured yet, bad ID, network error) — keep the placeholder.
      });
  }

  return card;
}

function renderArtistas(disciplines) {
  renderTabs(document.getElementById('artistas-tabs'), [ALL_TAB, ...disciplines], artistasTab, (t) => {
    artistasTab = t;
    renderArtistas(disciplines);
  });

  const listEl = document.getElementById('artistas-list');
  listEl.innerHTML = '';
  const filtered = artistasTab === ALL_TAB ? allArtists : allArtists.filter((a) => a.discipline === artistasTab);
  filtered.forEach((artist) => {
    listEl.appendChild(renderArtistCard(artist));
  });
}

Promise.all([
  fetch('/api/meta').then((res) => res.json()),
  fetch('/api/artists').then((res) => res.json()),
]).then(([meta, artists]) => {
  allArtists = artists;
  renderArtistas(meta.disciplines);
});

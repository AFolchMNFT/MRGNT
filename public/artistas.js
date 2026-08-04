let artistasTab = 'Música';
let allArtists = [];

function renderTabs(container, tabs, active, onSelect) {
  container.innerHTML = '';
  tabs.forEach((t) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (t === active ? ' active' : '');
    btn.textContent = t;
    btn.addEventListener('click', () => onSelect(t));
    container.appendChild(btn);
  });
}

function renderArtistCard(artist) {
  const card = document.createElement('div');
  card.className = 'artist-card';
  card.innerHTML = `
    <div class="artist-image"></div>
    <div class="artist-body">
      ${artist.featured ? '<span class="artist-featured">Featured</span>' : ''}
      <h4 class="artist-name">${artist.name}</h4>
      <span class="artist-genre">${artist.genre}</span>
      ${artist.bio ? `<details class="artist-bio"><summary>Leer más</summary>${artist.bio}</details>` : ''}
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
        if (artist.showSpotifyEmbed) {
          const embedWrap = document.createElement('div');
          embedWrap.className = 'artist-spotify-embed';
          const iframe = document.createElement('iframe');
          iframe.src = `https://open.spotify.com/embed/artist/${artist.spotifyArtistId}`;
          iframe.width = '100%';
          iframe.height = '152';
          iframe.style.border = '0';
          iframe.loading = 'lazy';
          iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
          embedWrap.appendChild(iframe);
          card.querySelector('.artist-body').appendChild(embedWrap);
        }
      })
      .catch(() => {
        // No Spotify data available (not configured yet, bad ID, network error) — keep the placeholder.
      });
  }

  return card;
}

function renderArtistas(disciplines) {
  renderTabs(document.getElementById('artistas-tabs'), disciplines, artistasTab, (t) => {
    artistasTab = t;
    renderArtistas(disciplines);
  });

  const listEl = document.getElementById('artistas-list');
  listEl.innerHTML = '';
  allArtists.filter((a) => a.discipline === artistasTab).forEach((artist) => {
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

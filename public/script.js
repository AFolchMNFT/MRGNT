const ALL_TAB = '__all__';

let noticiasTab = null;
let artistasTab = 'Música';
let allArticles = [];
let allArtists = [];

function renderTabs(container, tabs, active, onSelect) {
  container.innerHTML = '';
  tabs.forEach((t) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (t === active ? ' active' : '');
    btn.textContent = t === ALL_TAB ? 'Todas' : t;
    btn.addEventListener('click', () => onSelect(t));
    container.appendChild(btn);
  });
}

function renderNoticias(categories) {
  renderTabs(document.getElementById('noticias-tabs'), [ALL_TAB, ...categories], noticiasTab, (t) => {
    noticiasTab = t;
    renderNoticias(categories);
  });

  const postsEl = document.getElementById('noticias-posts');
  postsEl.innerHTML = '';
  const filtered = noticiasTab === ALL_TAB ? allArticles : allArticles.filter((a) => a.category === noticiasTab);
  filtered.slice(0, 3).forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card post-card';
    card.innerHTML = `
      <span class="badge badge-rust">${post.category}</span>
      <h3><a href="noticia.html?slug=${encodeURIComponent(post.slug)}">${post.title}</a></h3>
      <span class="post-date">${post.date}</span>
    `;
    postsEl.appendChild(card);
  });
}

function renderEvents(events) {
  const listEl = document.getElementById('events-list');
  listEl.innerHTML = '';
  events.slice(0, 4).forEach((ev) => {
    const row = document.createElement(ev.slug ? 'a' : 'div');
    row.className = 'event-row';
    if (ev.slug) row.href = `evento.html?slug=${encodeURIComponent(ev.slug)}`;
    row.innerHTML = `
      <span class="event-time">${ev.day} ${ev.date.split(' ')[0]} ${ev.date.split(' ')[1].toUpperCase()} · ${ev.time}</span>
      <div class="event-main">
        <span class="event-artist">${ev.artist}</span>
        <span class="event-stage">${ev.stage}</span>
      </div>
      ${ev.tag ? `<span class="event-tag">${ev.tag}</span>` : ''}
    `;
    listEl.appendChild(row);
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
  fetch('/api/articles').then((res) => res.json()),
  fetch('/api/events').then((res) => res.json()),
  fetch('/api/artists').then((res) => res.json()),
]).then(([meta, articles, events, artists]) => {
  noticiasTab = ALL_TAB;
  allArticles = articles;
  allArtists = artists;
  renderNoticias(meta.noticiasCategories);
  renderEvents(events);
  renderArtistas(meta.disciplines);
});

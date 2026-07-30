let noticiasTab = noticiasCategories[0];
let artistasTab = 'Música';

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

function renderNoticias() {
  renderTabs(document.getElementById('noticias-tabs'), noticiasCategories, noticiasTab, (t) => {
    noticiasTab = t;
    renderNoticias();
  });

  const postsEl = document.getElementById('noticias-posts');
  postsEl.innerHTML = '';
  articles.filter((a) => a.category === noticiasTab).slice(0, 3).forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card post-card';
    card.innerHTML = `
      <span class="badge badge-rust">${post.category}</span>
      <h3><a href="noticias.html">${post.title}</a></h3>
      <span class="post-date">${post.date}</span>
    `;
    postsEl.appendChild(card);
  });
}

function renderEvents() {
  const listEl = document.getElementById('events-list');
  listEl.innerHTML = '';
  events.slice(0, 4).forEach((ev) => {
    const row = document.createElement('div');
    row.className = 'event-row';
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

function renderArtistas() {
  renderTabs(document.getElementById('artistas-tabs'), disciplines, artistasTab, (t) => {
    artistasTab = t;
    renderArtistas();
  });

  const listEl = document.getElementById('artistas-list');
  listEl.innerHTML = '';
  artists.filter((a) => a.discipline === artistasTab).forEach((artist) => {
    const card = document.createElement('div');
    card.className = 'artist-card';
    card.innerHTML = `
      <div class="artist-image"></div>
      <div class="artist-body">
        ${artist.featured ? '<span class="artist-featured">Featured</span>' : ''}
        <h4 class="artist-name">${artist.name}</h4>
        <span class="artist-genre">${artist.genre}</span>
      </div>
    `;
    listEl.appendChild(card);
  });
}

renderNoticias();
renderEvents();
renderArtistas();

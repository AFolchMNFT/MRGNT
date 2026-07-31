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

function renderArtistas(disciplines) {
  renderTabs(document.getElementById('artistas-tabs'), disciplines, artistasTab, (t) => {
    artistasTab = t;
    renderArtistas(disciplines);
  });

  const listEl = document.getElementById('artistas-list');
  listEl.innerHTML = '';
  allArtists.filter((a) => a.discipline === artistasTab).forEach((artist) => {
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

Promise.all([
  fetch('/api/meta').then((res) => res.json()),
  fetch('/api/artists').then((res) => res.json()),
]).then(([meta, artists]) => {
  allArtists = artists;
  renderArtistas(meta.disciplines);
});

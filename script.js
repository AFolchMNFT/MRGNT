const noticiasTabs = ['Blogs de opinión', 'Reportaje de eventos', 'Periodismo musical', 'Entrevistas'];
const artistasTabs = ['Poesía', 'Declamación', 'Música', 'Artes visuales', 'Escultura'];

const noticiasData = {
  'Blogs de opinión': [
    { title: '¿Por qué el escenario chico siempre roba la función?', date: '12 jul', href: '#' },
    { title: 'Cinco discos que definieron el año en la escena local', date: '05 jul', href: '#' },
    { title: 'La declamación no está muerta, solo se cambió de casa', date: '28 jun', href: '#' },
  ],
  'Reportaje de eventos': [
    { title: 'Así se vivió la noche de poesía + música en vivo', date: '10 jul', href: '#' },
    { title: 'Detrás de cámaras: montando la expo de artes visuales', date: '02 jul', href: '#' },
    { title: 'Crónica: escultura en vivo en el Patio MRGNT', date: '24 jun', href: '#' },
  ],
  'Periodismo musical': [
    { title: 'Cómo se arma el cartelera de MRGNT cada temporada', date: '14 jul', href: '#' },
    { title: 'Entre bambalinas con el equipo de sonido', date: '07 jul', href: '#' },
    { title: 'El circuito independiente sigue creciendo', date: '30 jun', href: '#' },
  ],
  'Entrevistas': [
    { title: 'Conoce a la artista detrás del mural de este año', date: '11 jul', href: '#' },
    { title: '"La escultura también se improvisa" — plática con un escultor', date: '03 jul', href: '#' },
    { title: 'Cinco preguntas a la nueva generación de declamadores', date: '26 jun', href: '#' },
  ],
};

const artistasData = {
  'Poesía': [
    { name: 'Renata Vidal', genre: 'Poesía escénica', featured: true },
    { name: 'Julián Reyes', genre: 'Poesía experimental' },
    { name: 'Colectivo Tinta Cruda', genre: 'Poesía coral' },
  ],
  'Declamación': [
    { name: 'Marcos del Río', genre: 'Declamación clásica', featured: true },
    { name: 'Lucía Ferreyra', genre: 'Declamación contemporánea' },
  ],
  'Música': [
    { name: 'Nova Sol', genre: 'Afrobeat / Electrónica', featured: true },
    { name: 'Kessler', genre: 'Techno' },
    { name: 'Marigold Static', genre: 'Indie / Dream pop' },
    { name: 'DJ Compass', genre: 'House' },
  ],
  'Artes visuales': [
    { name: 'Ana Belén Ruiz', genre: 'Muralismo', featured: true },
    { name: 'Tomás Higuera', genre: 'Fotografía documental' },
    { name: 'Colectivo Órbita', genre: 'Instalación' },
  ],
  'Escultura': [
    { name: 'Ignacio Prado', genre: 'Escultura en metal', featured: true },
    { name: 'Cami Salgado', genre: 'Escultura en barro' },
  ],
};

const events = [
  { time: 'SÁB 08 AGO · 8PM', stage: 'Foro Central', artist: 'Noche de poesía + música en vivo', tag: 'Destacado' },
  { time: 'VIE 14 AGO · 7:30PM', stage: 'Galería Norte', artist: 'Exposición de artes visuales', tag: '' },
  { time: 'DOM 23 AGO · 6PM', stage: 'Patio MRGNT', artist: 'Escultura en vivo + banda invitada', tag: '' },
  { time: 'SÁB 29 AGO · 9PM', stage: 'Main Stage', artist: 'Nova Sol', tag: 'Headliner' },
];

let noticiasTab = noticiasTabs[0];
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
  renderTabs(document.getElementById('noticias-tabs'), noticiasTabs, noticiasTab, (t) => {
    noticiasTab = t;
    renderNoticias();
  });

  const postsEl = document.getElementById('noticias-posts');
  postsEl.innerHTML = '';
  (noticiasData[noticiasTab] || []).forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card post-card';
    card.innerHTML = `
      <span class="badge badge-rust">${noticiasTab}</span>
      <h3><a href="${post.href}">${post.title}</a></h3>
      <span class="post-date">${post.date}</span>
    `;
    postsEl.appendChild(card);
  });
}

function renderEvents() {
  const listEl = document.getElementById('events-list');
  listEl.innerHTML = '';
  events.forEach((ev) => {
    const row = document.createElement('div');
    row.className = 'event-row';
    row.innerHTML = `
      <span class="event-time">${ev.time}</span>
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
  renderTabs(document.getElementById('artistas-tabs'), artistasTabs, artistasTab, (t) => {
    artistasTab = t;
    renderArtistas();
  });

  const listEl = document.getElementById('artistas-list');
  listEl.innerHTML = '';
  (artistasData[artistasTab] || []).forEach((artist) => {
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

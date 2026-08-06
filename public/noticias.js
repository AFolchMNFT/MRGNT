const ALL_TAB = '__all__';

let noticiasTab = null;
let allArticles = [];

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2];
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

function cardThumbHTML(post) {
  if (post.media && post.mediaType !== 'video') {
    return `<div class="card-thumb"><img src="${post.media}" alt="" loading="lazy"></div>`;
  }
  if (post.media && post.mediaType === 'video') {
    return `<div class="card-thumb"><video src="${post.media}" muted playsinline preload="metadata"></video></div>`;
  }
  if (post.embedProvider === 'youtube' && post.embedUrl) {
    const videoId = extractYouTubeId(post.embedUrl);
    if (videoId) {
      return `<div class="card-thumb"><img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="" loading="lazy"></div>`;
    }
  }
  if (post.embedProvider) {
    return `<div class="card-thumb card-thumb-embed"><span>${post.embedProvider}</span></div>`;
  }
  return '';
}

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

function renderArticles(categories) {
  renderTabs(document.getElementById('noticias-tabs'), [ALL_TAB, ...categories], noticiasTab, (t) => {
    noticiasTab = t;
    renderArticles(categories);
  });

  const postsEl = document.getElementById('noticias-posts');
  postsEl.innerHTML = '';
  const filtered = noticiasTab === ALL_TAB ? allArticles : allArticles.filter((a) => a.category === noticiasTab);
  filtered.forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card article-card';
    card.innerHTML = `
      ${cardThumbHTML(post)}
      <span class="badge badge-rust">${post.category}</span>
      <h3><a href="noticia.html?slug=${encodeURIComponent(post.slug)}">${post.title}</a></h3>
      <p class="article-excerpt">${post.excerpt}</p>
      <span class="article-meta">${post.author} · ${post.date}</span>
    `;
    postsEl.appendChild(card);
  });
}

Promise.all([
  fetch('/api/meta').then((res) => res.json()),
  fetch('/api/articles').then((res) => res.json()),
]).then(([meta, articles]) => {
  noticiasTab = ALL_TAB;
  allArticles = articles;
  renderArticles(meta.noticiasCategories);
});

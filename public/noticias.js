let noticiasTab = null;
let allArticles = [];

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

function renderArticles(categories) {
  renderTabs(document.getElementById('noticias-tabs'), categories, noticiasTab, (t) => {
    noticiasTab = t;
    renderArticles(categories);
  });

  const postsEl = document.getElementById('noticias-posts');
  postsEl.innerHTML = '';
  allArticles.filter((a) => a.category === noticiasTab).forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card article-card';
    card.innerHTML = `
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
  noticiasTab = meta.noticiasCategories[0];
  allArticles = articles;
  renderArticles(meta.noticiasCategories);
});

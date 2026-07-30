let noticiasTab = noticiasCategories[0];

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

function renderArticles() {
  renderTabs(document.getElementById('noticias-tabs'), noticiasCategories, noticiasTab, (t) => {
    noticiasTab = t;
    renderArticles();
  });

  const postsEl = document.getElementById('noticias-posts');
  postsEl.innerHTML = '';
  articles.filter((a) => a.category === noticiasTab).forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card article-card';
    card.innerHTML = `
      <span class="badge badge-rust">${post.category}</span>
      <h3>${post.title}</h3>
      <p class="article-excerpt">${post.excerpt}</p>
      <span class="article-meta">${post.author} · ${post.date}</span>
    `;
    postsEl.appendChild(card);
  });
}

renderArticles();

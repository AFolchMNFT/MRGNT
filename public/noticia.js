function getSlugParam() {
  return new URLSearchParams(window.location.search).get('slug');
}

function renderNotFound() {
  document.getElementById('noticia-title').textContent = 'Artículo no encontrado';
  document.getElementById('noticia-category').hidden = true;
  document.getElementById('noticia-meta').textContent = '';
  document.getElementById('noticia-body').innerHTML = '<p>Este artículo no existe o fue eliminado.</p>';
}

function renderNoticia(article) {
  document.title = `${article.title} — MRGNT`;
  document.getElementById('noticia-category').textContent = article.category;
  document.getElementById('noticia-title').textContent = article.title;
  document.getElementById('noticia-meta').textContent = `${article.author} · ${article.date}`;

  const mediaEl = document.getElementById('noticia-media');
  mediaEl.innerHTML = '';
  if (article.media) {
    const el = article.mediaType === 'video' ? document.createElement('video') : document.createElement('img');
    el.src = article.media;
    if (article.mediaType === 'video') el.controls = true;
    else el.alt = article.title;
    mediaEl.appendChild(el);
    mediaEl.hidden = false;
  } else {
    mediaEl.hidden = true;
  }

  const bodyEl = document.getElementById('noticia-body');
  bodyEl.innerHTML = '';
  const note = (article.note || '').replace(/\r\n/g, '\n');
  note.split(/\n{2,}/).forEach((paragraph) => {
    const p = document.createElement('p');
    paragraph.split('\n').forEach((line, i) => {
      if (i > 0) p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(line));
    });
    bodyEl.appendChild(p);
  });
}

fetch('/api/articles')
  .then((res) => res.json())
  .then((articles) => {
    const article = articles.find((a) => a.slug === getSlugParam());
    if (!article) return renderNotFound();
    renderNoticia(article);
  });

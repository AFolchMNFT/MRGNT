import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js';
import { storage } from '/firebase-config.js';
import { apiFetch, requireAdminSession, renderAdminNav } from '/admin/admin-common.js';

let articles = [];
let editingId = null;
let currentMediaRemoved = false;

const form = document.getElementById('article-form');
const errorEl = document.getElementById('article-error');
const categorySelect = document.getElementById('article-category');
const listEl = document.getElementById('articles-list');
const cancelBtn = document.getElementById('article-cancel');
const submitBtn = document.getElementById('article-submit');
const headingEl = document.getElementById('form-heading');
const mediaInput = document.getElementById('article-media');
const mediaCurrentEl = document.getElementById('article-media-current');

function renderMediaPreview(article) {
  currentMediaRemoved = false;
  mediaInput.value = '';
  if (!article || !article.media) {
    mediaCurrentEl.hidden = true;
    mediaCurrentEl.innerHTML = '';
    return;
  }
  const mediaTag = article.mediaType === 'video'
    ? `<video src="${article.media}" controls></video>`
    : `<img src="${article.media}" alt="Media actual">`;
  mediaCurrentEl.innerHTML = `
    ${mediaTag}
    <div class="admin-checkbox-row">
      <input type="checkbox" id="article-remove-media">
      <label for="article-remove-media">Quitar media actual</label>
    </div>
  `;
  mediaCurrentEl.hidden = false;
  document.getElementById('article-remove-media').addEventListener('change', (e) => {
    currentMediaRemoved = e.target.checked;
  });
}

function resetForm() {
  editingId = null;
  form.reset();
  document.getElementById('article-id').value = '';
  cancelBtn.hidden = true;
  submitBtn.textContent = 'Guardar artículo';
  headingEl.textContent = 'NUEVO ARTÍCULO';
  errorEl.hidden = true;
  renderMediaPreview(null);
}

function startEdit(article) {
  editingId = article.id;
  document.getElementById('article-id').value = article.id;
  document.getElementById('article-title').value = article.title;
  categorySelect.value = article.category;
  document.getElementById('article-date').value = article.article_date;
  document.getElementById('article-author').value = article.author;
  document.getElementById('article-excerpt').value = article.excerpt;
  document.getElementById('article-note').value = article.note || '';
  renderMediaPreview(article);
  cancelBtn.hidden = false;
  submitBtn.textContent = 'Guardar cambios';
  headingEl.textContent = `EDITAR: ${article.title.toUpperCase()}`;
  errorEl.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderList() {
  listEl.innerHTML = '';
  if (!articles.length) {
    listEl.innerHTML = '<p class="admin-empty">Aún no hay artículos.</p>';
    return;
  }
  articles.forEach((article) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    const thumb = article.media && article.mediaType !== 'video'
      ? `<img class="admin-row-thumb" src="${article.media}" alt="">`
      : '';
    row.innerHTML = `
      ${thumb}
      <div class="admin-row-main">
        <div class="admin-row-title">${article.title}</div>
        <div class="admin-row-sub">${article.category} — ${article.author} · ${article.date}</div>
      </div>
      <div class="admin-row-actions">
        <a href="/noticia.html?slug=${encodeURIComponent(article.slug)}" target="_blank">Ver</a>
        <button type="button" class="admin-edit">Editar</button>
        <button type="button" class="admin-delete">Eliminar</button>
      </div>
    `;
    row.querySelector('.admin-edit').addEventListener('click', () => startEdit(article));
    row.querySelector('.admin-delete').addEventListener('click', () => deleteArticle(article));
    listEl.appendChild(row);
  });
}

async function loadArticles() {
  const res = await apiFetch('/api/articles');
  articles = await res.json();
  renderList();
}

async function deleteArticle(article) {
  if (!confirm(`¿Eliminar "${article.title}"?`)) return;
  const res = await apiFetch(`/api/articles/${article.id}`, { method: 'DELETE' });
  if (res.ok) {
    if (editingId === article.id) resetForm();
    await loadArticles();
  }
}

async function uploadMediaFile(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext ? '.' + ext : ''}`;
  const path = `articles/${filename}`;
  const ref = storageRef(storage, path);
  const task = uploadBytesResumable(ref, file);
  await new Promise((resolve, reject) => task.on('state_changed', null, reject, resolve));
  const url = await getDownloadURL(ref);
  return { url, path, mediaType: file.type.startsWith('video/') ? 'video' : 'image' };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const body = {
    title: document.getElementById('article-title').value,
    category: categorySelect.value,
    article_date: document.getElementById('article-date').value,
    author: document.getElementById('article-author').value,
    excerpt: document.getElementById('article-excerpt').value,
    note: document.getElementById('article-note').value,
  };

  if (mediaInput.files[0]) {
    try {
      const { url, path, mediaType } = await uploadMediaFile(mediaInput.files[0]);
      body.media = url;
      body.media_path = path;
      body.media_type = mediaType;
    } catch {
      errorEl.textContent = 'Error al subir el archivo. Inténtalo de nuevo.';
      errorEl.hidden = false;
      return;
    }
  }

  if (editingId && currentMediaRemoved) body.remove_media = true;

  const url = editingId ? `/api/articles/${editingId}` : '/api/articles';
  const method = editingId ? 'PUT' : 'POST';
  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  const resBody = await res.json().catch(() => ({}));
  if (!res.ok) {
    errorEl.textContent = resBody.error || 'No se pudo guardar el artículo';
    errorEl.hidden = false;
    return;
  }
  resetForm();
  await loadArticles();
});

cancelBtn.addEventListener('click', resetForm);

requireAdminSession().then(async (session) => {
  if (!session) return;
  renderAdminNav('articles');
  const meta = await (await apiFetch('/api/meta')).json();
  categorySelect.innerHTML = meta.noticiasCategories.map((c) => `<option value="${c}">${c}</option>`).join('');
  await loadArticles();
});

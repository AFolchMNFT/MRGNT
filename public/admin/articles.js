import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js';
import { storage } from '/firebase-config.js';
import { apiFetch, requireAdminSession, renderAdminNav } from '/admin/admin-common.js';
import { initRichEditor } from '/admin/rich-editor.js';

let articles = [];
let editingId = null;
let editingArticle = null;
let currentMediaRemoved = false;
let currentEmbedRemoved = false;

const form = document.getElementById('article-form');
const errorEl = document.getElementById('article-error');
const categorySelect = document.getElementById('article-category');
const listEl = document.getElementById('articles-list');
const cancelBtn = document.getElementById('article-cancel');
const submitBtn = document.getElementById('article-submit');
const headingEl = document.getElementById('form-heading');
const titleInput = document.getElementById('article-title');
const mediaInput = document.getElementById('article-media');
const mediaCurrentEl = document.getElementById('article-media-current');
const embedUrlInput = document.getElementById('article-embed-url');
const embedCurrentEl = document.getElementById('article-embed-current');
const noteEditor = initRichEditor(document.getElementById('article-note-editor'));
const socialGenerateBtn = document.getElementById('article-social-generate');
const socialErrorEl = document.getElementById('article-social-error');
const socialPreviewEl = document.getElementById('article-social-preview');
const socialPreviewImg = document.getElementById('article-social-preview-img');
const socialDownloadLink = document.getElementById('article-social-download');

function hasMedia() {
  if (mediaInput.files[0]) return true;
  if (editingId && editingArticle && editingArticle.media && !currentMediaRemoved) return true;
  return false;
}

function renderEmbedPreview(article) {
  currentEmbedRemoved = false;
  embedUrlInput.value = '';
  if (!article || !article.embedUrl) {
    embedCurrentEl.hidden = true;
    embedCurrentEl.innerHTML = '';
    return;
  }
  embedCurrentEl.innerHTML = `
    <a href="${article.embedUrl}" target="_blank" rel="noopener">${article.embedUrl}</a>
    <div class="admin-checkbox-row">
      <input type="checkbox" id="article-remove-embed">
      <label for="article-remove-embed">Quitar embed actual</label>
    </div>
  `;
  embedCurrentEl.hidden = false;
  document.getElementById('article-remove-embed').addEventListener('change', (e) => {
    currentEmbedRemoved = e.target.checked;
  });
}

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
  editingArticle = null;
  form.reset();
  document.getElementById('article-id').value = '';
  noteEditor.setHTML('');
  cancelBtn.hidden = true;
  submitBtn.textContent = 'Guardar artículo';
  headingEl.textContent = 'NUEVO ARTÍCULO';
  errorEl.hidden = true;
  renderMediaPreview(null);
  renderEmbedPreview(null);
  resetSocialPreview();
}

function startEdit(article) {
  editingId = article.id;
  editingArticle = article;
  document.getElementById('article-id').value = article.id;
  document.getElementById('article-title').value = article.title;
  categorySelect.value = article.category;
  document.getElementById('article-date').value = article.article_date;
  document.getElementById('article-author').value = article.author;
  document.getElementById('article-excerpt').value = article.excerpt;
  noteEditor.setHTML(article.note || '');
  renderMediaPreview(article);
  renderEmbedPreview(article);
  cancelBtn.hidden = false;
  submitBtn.textContent = 'Guardar cambios';
  headingEl.textContent = `EDITAR: ${article.title.toUpperCase()}`;
  errorEl.hidden = true;
  resetSocialPreview();
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

function resetSocialPreview() {
  socialErrorEl.hidden = true;
  socialPreviewEl.hidden = true;
  socialPreviewImg.removeAttribute('src');
  socialDownloadLink.removeAttribute('href');
}

function getPhotoSource() {
  const file = mediaInput.files[0];
  if (file) {
    if (!file.type.startsWith('image/')) return null;
    return { src: URL.createObjectURL(file), crossOrigin: false };
  }
  if (editingId && editingArticle && editingArticle.media && !currentMediaRemoved && editingArticle.mediaType !== 'video') {
    return { src: editingArticle.media, crossOrigin: true };
  }
  return null;
}

function loadImage({ src, crossOrigin }) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la foto para generar la imagen.'));
    img.src = src;
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const DIACRITICS_RE = new RegExp(`[${String.fromCodePoint(0x0300)}-${String.fromCodePoint(0x036f)}]`, 'g');

function slugifyForFilename(text) {
  return text.trim().toLowerCase()
    .normalize('NFD').replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'articulo';
}

async function generateSocialImage() {
  resetSocialPreview();

  const title = titleInput.value.trim();
  if (!title) {
    socialErrorEl.textContent = 'Escribe un título antes de generar la imagen.';
    socialErrorEl.hidden = false;
    return;
  }

  const photoSource = getPhotoSource();
  if (!photoSource) {
    socialErrorEl.textContent = 'Sube una foto (no video) para generar la imagen de redes sociales.';
    socialErrorEl.hidden = false;
    return;
  }

  socialGenerateBtn.disabled = true;
  try {
    await Promise.all([
      document.fonts.load('700 56px Bungee'),
      document.fonts.load('700 18px "Space Mono"'),
    ]).catch(() => {});

    const img = await loadImage(photoSource);

    const width = 1200;
    const height = 630;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const scale = Math.max(width / img.width, height / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    ctx.drawImage(img, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);

    const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height);
    gradient.addColorStop(0, 'rgba(20, 14, 10, 0)');
    gradient.addColorStop(1, 'rgba(20, 14, 10, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px Bungee, sans-serif';
    ctx.fillText('MRGNT', 48, 64);

    ctx.font = '700 56px Bungee, sans-serif';
    const lines = wrapText(ctx, title, width - 96).slice(0, 3);
    const lineHeight = 62;
    let lineY = height - 64 - (lines.length - 1) * lineHeight;
    const firstLineY = lineY;

    const category = categorySelect.value;
    if (category) {
      ctx.font = '700 18px "Space Mono", monospace';
      const badgeText = category.toUpperCase();
      const badgePaddingX = 16;
      const badgeWidth = ctx.measureText(badgeText).width + badgePaddingX * 2;
      const badgeHeight = 36;
      const badgeY = firstLineY - lineHeight - 6;
      ctx.fillStyle = '#c8502a';
      drawRoundedRect(ctx, 48, badgeY, badgeWidth, badgeHeight, 18);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(badgeText, 48 + badgePaddingX, badgeY + 24);
    }

    ctx.font = '700 56px Bungee, sans-serif';
    ctx.fillStyle = '#ffffff';
    lines.forEach((line) => {
      ctx.fillText(line, 48, lineY);
      lineY += lineHeight;
    });

    const dataUrl = canvas.toDataURL('image/png');
    socialPreviewImg.src = dataUrl;
    socialDownloadLink.href = dataUrl;
    socialDownloadLink.download = `${slugifyForFilename(title)}-social.png`;
    socialPreviewEl.hidden = false;
  } catch (err) {
    socialErrorEl.textContent = err.message || 'No se pudo generar la imagen. Inténtalo de nuevo.';
    socialErrorEl.hidden = false;
  } finally {
    socialGenerateBtn.disabled = false;
  }
}

socialGenerateBtn.addEventListener('click', generateSocialImage);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  if (!hasMedia()) {
    errorEl.textContent = 'Debes subir una foto de portada para el artículo.';
    errorEl.hidden = false;
    return;
  }

  const body = {
    title: document.getElementById('article-title').value,
    category: categorySelect.value,
    article_date: document.getElementById('article-date').value,
    author: document.getElementById('article-author').value,
    excerpt: document.getElementById('article-excerpt').value,
    note: noteEditor.getHTML(),
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

  if (embedUrlInput.value.trim()) {
    body.embed_url = embedUrlInput.value.trim();
  } else if (editingId && currentEmbedRemoved) {
    body.remove_embed = true;
  }

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

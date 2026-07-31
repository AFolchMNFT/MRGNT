let artists = [];
let editingId = null;

const form = document.getElementById('artist-form');
const errorEl = document.getElementById('artist-error');
const disciplineSelect = document.getElementById('artist-discipline');
const listEl = document.getElementById('artists-list');
const cancelBtn = document.getElementById('artist-cancel');
const submitBtn = document.getElementById('artist-submit');
const headingEl = document.getElementById('form-heading');

function resetForm() {
  editingId = null;
  form.reset();
  document.getElementById('artist-id').value = '';
  cancelBtn.hidden = true;
  submitBtn.textContent = 'Guardar artista';
  headingEl.textContent = 'NUEVO ARTISTA';
  errorEl.hidden = true;
}

function startEdit(artist) {
  editingId = artist.id;
  document.getElementById('artist-id').value = artist.id;
  document.getElementById('artist-name').value = artist.name;
  disciplineSelect.value = artist.discipline;
  document.getElementById('artist-genre').value = artist.genre;
  document.getElementById('artist-featured').checked = artist.featured;
  cancelBtn.hidden = false;
  submitBtn.textContent = 'Guardar cambios';
  headingEl.textContent = `EDITAR: ${artist.name.toUpperCase()}`;
  errorEl.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderList() {
  listEl.innerHTML = '';
  if (!artists.length) {
    listEl.innerHTML = '<p class="admin-empty">Aún no hay artistas.</p>';
    return;
  }
  artists.forEach((artist) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-main">
        <div class="admin-row-title">${artist.name}${artist.featured ? ' · Featured' : ''}</div>
        <div class="admin-row-sub">${artist.discipline} — ${artist.genre || 'Sin género'}</div>
      </div>
      <div class="admin-row-actions">
        <button type="button" class="admin-edit">Editar</button>
        <button type="button" class="admin-delete">Eliminar</button>
      </div>
    `;
    row.querySelector('.admin-edit').addEventListener('click', () => startEdit(artist));
    row.querySelector('.admin-delete').addEventListener('click', () => deleteArtist(artist));
    listEl.appendChild(row);
  });
}

async function loadArtists() {
  const res = await apiFetch('/api/artists');
  artists = await res.json();
  renderList();
}

async function deleteArtist(artist) {
  if (!confirm(`¿Eliminar a "${artist.name}"?`)) return;
  const res = await apiFetch(`/api/artists/${artist.id}`, { method: 'DELETE' });
  if (res.ok) {
    if (editingId === artist.id) resetForm();
    await loadArtists();
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  const payload = {
    name: document.getElementById('artist-name').value,
    discipline: disciplineSelect.value,
    genre: document.getElementById('artist-genre').value,
    featured: document.getElementById('artist-featured').checked,
  };
  const url = editingId ? `/api/artists/${editingId}` : '/api/artists';
  const method = editingId ? 'PUT' : 'POST';
  const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    errorEl.textContent = body.error || 'No se pudo guardar el artista';
    errorEl.hidden = false;
    return;
  }
  resetForm();
  await loadArtists();
});

cancelBtn.addEventListener('click', resetForm);

requireAdminSession().then(async (session) => {
  if (!session) return;
  renderAdminNav('artists');
  const meta = await (await apiFetch('/api/meta')).json();
  disciplineSelect.innerHTML = meta.disciplines.map((d) => `<option value="${d}">${d}</option>`).join('');
  await loadArtists();
});

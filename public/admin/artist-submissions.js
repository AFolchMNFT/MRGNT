import { apiFetch, requireAdminSession, renderAdminNav } from '/admin/admin-common.js';

const listEl = document.getElementById('submissions-list');

function openPreview(sub) {
  document.getElementById('preview-title').textContent = sub.name;
  document.getElementById('preview-meta').textContent = `${sub.discipline}${sub.genre ? ' — ' + sub.genre : ''}`;
  document.getElementById('preview-body').innerHTML = sub.bio || '';

  const spotifyEl = document.getElementById('preview-spotify-link');
  if (sub.spotifyArtistId) {
    spotifyEl.href = `https://open.spotify.com/artist/${sub.spotifyArtistId}`;
    spotifyEl.hidden = false;
  } else {
    spotifyEl.hidden = true;
  }

  document.getElementById('preview-overlay').hidden = false;
}

function closePreview() {
  document.getElementById('preview-overlay').hidden = true;
}

document.getElementById('preview-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'preview-overlay') closePreview();
});
document.getElementById('preview-close').addEventListener('click', closePreview);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePreview();
});

function renderList(submissions) {
  listEl.innerHTML = '';
  if (!submissions.length) {
    listEl.innerHTML = '<p class="admin-empty">No hay solicitudes pendientes.</p>';
    return;
  }
  submissions.forEach((sub) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-main">
        <div class="admin-row-title">${sub.name}</div>
        <div class="admin-row-sub">${sub.discipline}${sub.genre ? ' — ' + sub.genre : ''}</div>
        <div class="admin-row-sub">Enviado por ${sub.submitterName} (${sub.submitterEmail})</div>
      </div>
      <div class="admin-row-actions">
        <button type="button" class="admin-preview">Ver</button>
        <button type="button" class="admin-approve">Aprobar</button>
        <button type="button" class="admin-delete">Rechazar</button>
      </div>
    `;
    row.querySelector('.admin-preview').addEventListener('click', () => openPreview(sub));
    row.querySelector('.admin-approve').addEventListener('click', () => approveSubmission(sub));
    row.querySelector('.admin-delete').addEventListener('click', () => rejectSubmission(sub));
    listEl.appendChild(row);
  });
}

async function loadSubmissions() {
  const res = await apiFetch('/api/artist-submissions');
  const submissions = await res.json();
  renderList(submissions);
}

async function approveSubmission(sub) {
  if (!confirm(`¿Aprobar y publicar a "${sub.name}"?`)) return;
  const res = await apiFetch(`/api/artist-submissions/${sub.id}/approve`, { method: 'POST' });
  if (res.ok) await loadSubmissions();
  else alert('No se pudo aprobar la solicitud');
}

async function rejectSubmission(sub) {
  if (!confirm(`¿Rechazar y eliminar la solicitud de "${sub.name}"?`)) return;
  const res = await apiFetch(`/api/artist-submissions/${sub.id}`, { method: 'DELETE' });
  if (res.ok) await loadSubmissions();
  else alert('No se pudo rechazar la solicitud');
}

requireAdminSession(['admin']).then(async (session) => {
  if (!session) return;
  renderAdminNav('artist-submissions', session.role);
  await loadSubmissions();
});

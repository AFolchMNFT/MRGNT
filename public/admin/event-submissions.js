import { apiFetch, requireAdminSession, renderAdminNav } from '/admin/admin-common.js';

const listEl = document.getElementById('submissions-list');

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
        <div class="admin-row-title">${sub.artist}${sub.title ? ' — ' + sub.title : ''}${sub.tag ? ' · ' + sub.tag : ''}</div>
        <div class="admin-row-sub">${sub.day} ${sub.date} · ${sub.time} — ${sub.stage}${sub.cost ? ' · ' + sub.cost : ''}</div>
        <div class="admin-row-sub">Enviado por ${sub.submitterName} (${sub.submitterEmail})</div>
      </div>
      <div class="admin-row-actions">
        ${sub.locationUrl ? `<a href="${sub.locationUrl}" target="_blank" rel="noopener">Mapa</a>` : ''}
        <button type="button" class="admin-approve">Aprobar</button>
        <button type="button" class="admin-delete">Rechazar</button>
      </div>
    `;
    row.querySelector('.admin-approve').addEventListener('click', () => approveSubmission(sub));
    row.querySelector('.admin-delete').addEventListener('click', () => rejectSubmission(sub));
    listEl.appendChild(row);
  });
}

async function loadSubmissions() {
  const res = await apiFetch('/api/event-submissions');
  const submissions = await res.json();
  renderList(submissions);
}

async function approveSubmission(sub) {
  if (!confirm(`¿Aprobar y publicar "${sub.artist}" (${sub.date})?`)) return;
  const res = await apiFetch(`/api/event-submissions/${sub.id}/approve`, { method: 'POST' });
  if (res.ok) await loadSubmissions();
  else alert('No se pudo aprobar la solicitud');
}

async function rejectSubmission(sub) {
  if (!confirm(`¿Rechazar y eliminar la solicitud de "${sub.artist}"?`)) return;
  const res = await apiFetch(`/api/event-submissions/${sub.id}`, { method: 'DELETE' });
  if (res.ok) await loadSubmissions();
  else alert('No se pudo rechazar la solicitud');
}

requireAdminSession().then(async (session) => {
  if (!session) return;
  renderAdminNav('submissions');
  await loadSubmissions();
});

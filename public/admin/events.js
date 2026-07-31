import { apiFetch, requireAdminSession, renderAdminNav } from '/admin/admin-common.js';

let events = [];
let editingId = null;

const form = document.getElementById('event-form');
const errorEl = document.getElementById('event-error');
const listEl = document.getElementById('events-list');
const cancelBtn = document.getElementById('event-cancel');
const submitBtn = document.getElementById('event-submit');
const headingEl = document.getElementById('form-heading');

function resetForm() {
  editingId = null;
  form.reset();
  document.getElementById('event-id').value = '';
  cancelBtn.hidden = true;
  submitBtn.textContent = 'Guardar evento';
  headingEl.textContent = 'NUEVO EVENTO';
  errorEl.hidden = true;
}

function startEdit(ev) {
  editingId = ev.id;
  document.getElementById('event-id').value = ev.id;
  document.getElementById('event-date').value = ev.event_date;
  document.getElementById('event-time').value = ev.time;
  document.getElementById('event-stage').value = ev.stage;
  document.getElementById('event-artist').value = ev.artist;
  document.getElementById('event-tag').value = ev.tag;
  cancelBtn.hidden = false;
  submitBtn.textContent = 'Guardar cambios';
  headingEl.textContent = `EDITAR: ${ev.artist.toUpperCase()}`;
  errorEl.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderList() {
  listEl.innerHTML = '';
  if (!events.length) {
    listEl.innerHTML = '<p class="admin-empty">Aún no hay eventos.</p>';
    return;
  }
  events.forEach((ev) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-main">
        <div class="admin-row-title">${ev.artist}${ev.tag ? ' · ' + ev.tag : ''}</div>
        <div class="admin-row-sub">${ev.day} ${ev.date} · ${ev.time} — ${ev.stage}</div>
      </div>
      <div class="admin-row-actions">
        <button type="button" class="admin-edit">Editar</button>
        <button type="button" class="admin-delete">Eliminar</button>
      </div>
    `;
    row.querySelector('.admin-edit').addEventListener('click', () => startEdit(ev));
    row.querySelector('.admin-delete').addEventListener('click', () => deleteEvent(ev));
    listEl.appendChild(row);
  });
}

async function loadEvents() {
  const res = await apiFetch('/api/events');
  events = await res.json();
  renderList();
}

async function deleteEvent(ev) {
  if (!confirm(`¿Eliminar "${ev.artist}" (${ev.date})?`)) return;
  const res = await apiFetch(`/api/events/${ev.id}`, { method: 'DELETE' });
  if (res.ok) {
    if (editingId === ev.id) resetForm();
    await loadEvents();
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  const payload = {
    event_date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    stage: document.getElementById('event-stage').value,
    artist: document.getElementById('event-artist').value,
    tag: document.getElementById('event-tag').value,
  };
  const url = editingId ? `/api/events/${editingId}` : '/api/events';
  const method = editingId ? 'PUT' : 'POST';
  const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    errorEl.textContent = body.error || 'No se pudo guardar el evento';
    errorEl.hidden = false;
    return;
  }
  resetForm();
  await loadEvents();
});

cancelBtn.addEventListener('click', resetForm);

requireAdminSession().then(async (session) => {
  if (!session) return;
  renderAdminNav('events');
  await loadEvents();
});

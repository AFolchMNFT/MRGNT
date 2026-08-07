import { apiFetch, requireAdminSession, renderAdminNav } from '/admin/admin-common.js';

let users = [];
let currentUid = null;

const form = document.getElementById('user-form');
const errorEl = document.getElementById('user-error');
const successEl = document.getElementById('user-success');
const emailInput = document.getElementById('user-email');
const passwordInput = document.getElementById('user-password');
const roleSelect = document.getElementById('user-role');
const listEl = document.getElementById('users-list');

const ROLE_LABEL = { admin: 'Administrador', writer: 'Redactor' };

function renderList() {
  listEl.innerHTML = '';
  if (!users.length) {
    listEl.innerHTML = '<p class="admin-empty">Aún no hay usuarios.</p>';
    return;
  }
  users.forEach((user) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    const isSelf = user.uid === currentUid;
    row.innerHTML = `
      <div class="admin-row-main">
        <div class="admin-row-title">${user.email}</div>
        <div class="admin-row-sub">${ROLE_LABEL[user.role] || user.role}${isSelf ? ' · tú' : ''}</div>
      </div>
      <div class="admin-row-actions">
        ${!isSelf ? `<button type="button" class="admin-toggle-role">Cambiar a ${user.role === 'admin' ? 'Redactor' : 'Administrador'}</button>` : ''}
        ${!isSelf ? '<button type="button" class="admin-delete">Eliminar</button>' : ''}
      </div>
    `;
    if (!isSelf) {
      row.querySelector('.admin-toggle-role').addEventListener('click', () => changeRole(user));
      row.querySelector('.admin-delete').addEventListener('click', () => deleteUser(user));
    }
    listEl.appendChild(row);
  });
}

async function loadUsers() {
  const res = await apiFetch('/api/users');
  users = await res.json();
  renderList();
}

async function changeRole(user) {
  const newRole = user.role === 'admin' ? 'writer' : 'admin';
  if (!confirm(`¿Cambiar el rol de ${user.email} a ${ROLE_LABEL[newRole]}?`)) return;
  const res = await apiFetch(`/api/users/${user.uid}/role`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
  if (res.ok) await loadUsers();
  else alert('No se pudo cambiar el rol');
}

async function deleteUser(user) {
  if (!confirm(`¿Eliminar la cuenta de ${user.email}? Esta acción no se puede deshacer.`)) return;
  const res = await apiFetch(`/api/users/${user.uid}`, { method: 'DELETE' });
  if (res.ok) await loadUsers();
  else alert('No se pudo eliminar la cuenta');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  successEl.hidden = true;

  const body = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
    role: roleSelect.value,
  };

  const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(body) });
  const resBody = await res.json().catch(() => ({}));
  if (!res.ok) {
    errorEl.textContent = resBody.error || 'No se pudo crear la cuenta';
    errorEl.hidden = false;
    return;
  }
  successEl.textContent = `Cuenta creada para ${body.email}. Comparte la contraseña con la persona.`;
  successEl.hidden = false;
  form.reset();
  roleSelect.value = 'writer';
  await loadUsers();
});

requireAdminSession(['admin']).then(async (session) => {
  if (!session) return;
  currentUid = session.user.uid;
  renderAdminNav('users', session.role);
  await loadUsers();
});

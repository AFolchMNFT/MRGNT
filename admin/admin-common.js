async function apiFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(url, {
    ...options,
    headers: isFormData ? { ...(options.headers || {}) } : { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (res.status === 401) {
    window.location.href = '/admin/login.html';
    throw new Error('No autenticado');
  }
  return res;
}

async function requireAdminSession() {
  const res = await fetch('/api/me');
  if (res.status === 401) {
    window.location.href = '/admin/login.html';
    return null;
  }
  return res.json();
}

function renderAdminNav(active) {
  const nav = document.createElement('nav');
  nav.className = 'admin-nav';
  nav.innerHTML = `
    <a href="/admin/index.html" class="admin-nav-brand">MRGNT admin</a>
    <div class="admin-nav-links">
      <a href="/admin/artists.html" class="admin-nav-link${active === 'artists' ? ' active' : ''}">Artistas</a>
      <a href="/admin/events.html" class="admin-nav-link${active === 'events' ? ' active' : ''}">Eventos</a>
      <a href="/admin/articles.html" class="admin-nav-link${active === 'articles' ? ' active' : ''}">Noticias</a>
      <button type="button" class="admin-nav-logout" id="admin-logout">Cerrar sesión</button>
    </div>
  `;
  document.body.prepend(nav);
  nav.querySelector('#admin-logout').addEventListener('click', async () => {
    await apiFetch('/api/logout', { method: 'POST' });
    window.location.href = '/admin/login.html';
  });
}

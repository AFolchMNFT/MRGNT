import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import { auth } from '/firebase-config.js';

export async function apiFetch(url, options = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    window.location.href = '/admin/login.html';
    throw new Error('No autenticado');
  }
  return res;
}

export function requireAdminSession() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        window.location.href = '/admin/login.html';
        return resolve(null);
      }
      const token = await user.getIdTokenResult();
      if (!token.claims.admin) {
        await signOut(auth);
        window.location.href = '/admin/login.html';
        return resolve(null);
      }
      resolve(user);
    });
  });
}

export function renderAdminNav(active) {
  const nav = document.createElement('nav');
  nav.className = 'admin-nav';
  nav.innerHTML = `
    <a href="/admin/index.html" class="admin-nav-brand">MRGNT admin</a>
    <div class="admin-nav-links">
      <a href="/admin/artists.html" class="admin-nav-link${active === 'artists' ? ' active' : ''}">Artistas</a>
      <a href="/admin/events.html" class="admin-nav-link${active === 'events' ? ' active' : ''}">Eventos</a>
      <a href="/admin/event-submissions.html" class="admin-nav-link${active === 'submissions' ? ' active' : ''}">Solicitudes</a>
      <a href="/admin/articles.html" class="admin-nav-link${active === 'articles' ? ' active' : ''}">Noticias</a>
      <button type="button" class="admin-nav-logout" id="admin-logout">Cerrar sesión</button>
    </div>
  `;
  document.body.prepend(nav);
  nav.querySelector('#admin-logout').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = '/admin/login.html';
  });
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    errorEl.textContent = body.error || 'No se pudo iniciar sesión';
    errorEl.hidden = false;
    return;
  }

  window.location.href = '/admin/index.html';
});

(async () => {
  const res = await fetch('/api/me');
  if (res.ok) window.location.href = '/admin/index.html';
})();

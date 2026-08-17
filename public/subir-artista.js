const form = document.getElementById('artist-submit-form');
const errorEl = document.getElementById('artist-submit-error');
const successEl = document.getElementById('artist-submit-success');
const submitBtn = document.getElementById('artist-submit-btn');
const disciplineSelect = document.getElementById('artist-discipline');

fetch('/api/meta')
  .then((res) => res.json())
  .then((meta) => {
    disciplineSelect.innerHTML = meta.disciplines.map((d) => `<option value="${d}">${d}</option>`).join('');
  });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  successEl.hidden = true;

  const payload = {
    name: document.getElementById('artist-name').value,
    discipline: disciplineSelect.value,
    genre: document.getElementById('artist-genre').value,
    bio: document.getElementById('artist-bio').value,
    spotify_artist_id: document.getElementById('artist-spotify').value,
    submitter_name: document.getElementById('artist-submitter-name').value,
    submitter_email: document.getElementById('artist-submitter-email').value,
    website: document.getElementById('artist-website').value,
  };

  submitBtn.disabled = true;
  try {
    const res = await fetch('/api/artist-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      errorEl.textContent = body.error || 'No se pudo enviar el artista. Inténtalo de nuevo.';
      errorEl.hidden = false;
      return;
    }
    form.reset();
    successEl.textContent = '¡Gracias! Recibimos tu propuesta y la revisaremos antes de publicarla.';
    successEl.hidden = false;
  } catch {
    errorEl.textContent = 'No se pudo enviar el artista. Revisa tu conexión e inténtalo de nuevo.';
    errorEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
  }
});

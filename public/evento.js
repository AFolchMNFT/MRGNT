function getSlugParam() {
  return new URLSearchParams(window.location.search).get('slug');
}

function renderNotFound() {
  document.getElementById('evento-title').textContent = 'Evento no encontrado';
  document.getElementById('evento-meta').textContent = '';
  document.getElementById('evento-body').innerHTML = '<p>Este evento no existe o fue eliminado.</p>';
}

function renderEvento(ev) {
  document.title = `${ev.displayTitle} — MRGNT`;
  document.getElementById('evento-title').textContent = ev.displayTitle;
  document.getElementById('evento-meta').textContent = `${ev.day} ${ev.date} · ${ev.time} — ${ev.stage}`;

  const bodyEl = document.getElementById('evento-body');
  bodyEl.innerHTML = ev.description || '';

  const costEl = document.getElementById('evento-cost');
  if (ev.cost) {
    costEl.textContent = `Costo: ${ev.cost}`;
    costEl.hidden = false;
  } else {
    costEl.hidden = true;
  }

  const ticketEl = document.getElementById('evento-ticket-link');
  if (ev.ticket_link) {
    ticketEl.href = ev.ticket_link;
    ticketEl.hidden = false;
  } else {
    ticketEl.hidden = true;
  }
}

fetch('/api/events')
  .then((res) => res.json())
  .then((events) => {
    const ev = events.find((e) => e.slug === getSlugParam());
    if (!ev) return renderNotFound();
    renderEvento(ev);
  });

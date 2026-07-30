const MONTH_NAMES = {
  ene: 'Enero', feb: 'Febrero', mar: 'Marzo', abr: 'Abril', may: 'Mayo', jun: 'Junio',
  jul: 'Julio', ago: 'Agosto', sep: 'Septiembre', oct: 'Octubre', nov: 'Noviembre', dic: 'Diciembre',
};

function groupEventsByMonth(list) {
  const groups = [];
  const byKey = {};
  list.forEach((ev) => {
    const [, month, year] = ev.date.split(' ');
    const key = month + ' ' + year;
    if (!byKey[key]) {
      byKey[key] = { label: `${MONTH_NAMES[month.toLowerCase()] || month} ${year}`.toUpperCase(), events: [] };
      groups.push(byKey[key]);
    }
    byKey[key].events.push(ev);
  });
  return groups;
}

function renderEventos() {
  const container = document.getElementById('eventos-groups');
  container.innerHTML = '';

  groupEventsByMonth(events).forEach((group) => {
    const monthEl = document.createElement('div');
    monthEl.className = 'eventos-month';

    const heading = document.createElement('h2');
    heading.textContent = group.label;
    monthEl.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'events-list';
    group.events.forEach((ev) => {
      const [day, month] = ev.date.split(' ');
      const row = document.createElement('div');
      row.className = 'event-row';
      row.innerHTML = `
        <span class="event-time">${ev.day} ${day} ${month.toUpperCase()} · ${ev.time}</span>
        <div class="event-main">
          <span class="event-artist">${ev.artist}</span>
          <span class="event-stage">${ev.stage}</span>
        </div>
        ${ev.tag ? `<span class="event-tag">${ev.tag}</span>` : ''}
      `;
      list.appendChild(row);
    });
    monthEl.appendChild(list);
    container.appendChild(monthEl);
  });
}

renderEventos();

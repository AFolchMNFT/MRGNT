const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DAY_ABBR = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function isoToDisplay(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${MONTH_ABBR[month - 1]} ${year}`;
}

function dayAbbrev(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return DAY_ABBR[weekday];
}

function displayToIso(display) {
  const [day, mon, year] = display.trim().split(/\s+/);
  const month = MONTH_ABBR.indexOf(mon.toLowerCase()) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

module.exports = { isoToDisplay, dayAbbrev, displayToIso };

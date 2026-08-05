const admin = require('firebase-admin');
const { defineSecret, defineString } = require('firebase-functions/params');

const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const MAIL_FROM = defineString('MAIL_FROM', { default: 'MRGNT <onboarding@resend.dev>' });

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

async function getAdminEmails() {
  const emails = [];
  let pageToken;
  do {
    const page = await admin.auth().listUsers(1000, pageToken);
    page.users.forEach((u) => {
      if (u.customClaims && u.customClaims.admin && u.email) emails.push(u.email);
    });
    pageToken = page.pageToken;
  } while (pageToken);
  return emails;
}

function getBaseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

async function notifyAdminsOfEventSubmission(submission, req) {
  const apiKey = RESEND_API_KEY.value();
  if (!apiKey) {
    console.warn('RESEND_API_KEY no configurada; se omite el correo de notificación de evento.');
    return;
  }

  const emails = await getAdminEmails();
  if (!emails.length) {
    console.warn('No hay administradores para notificar sobre el nuevo evento.');
    return;
  }

  const reviewUrl = `${getBaseUrl(req)}/admin/event-submissions.html`;
  const from = MAIL_FROM.value();

  const fields = [
    ['Fecha', `${submission.date} (${submission.event_date})`],
    ['Hora', submission.time],
    ['Escenario', submission.stage],
    ['Artista / acto', submission.artist],
    ['Título', submission.title || '—'],
    ['Etiqueta', submission.tag || '—'],
    ['Costo', submission.cost || '—'],
    ['Enlace de boletos', submission.ticket_link || '—'],
    ['Ubicación (Google Maps)', submission.locationUrl || '—'],
    ['Enviado por', `${submission.submitter_name} <${submission.submitter_email}>`],
  ];

  const rowsHtml = fields.map(([label, value]) => `
    <tr>
      <td style="font-weight:bold;vertical-align:top;padding:4px 12px 4px 0;white-space:nowrap">${escapeHtml(label)}</td>
      <td style="padding:4px 0">${escapeHtml(value)}</td>
    </tr>
  `).join('');

  const html = `
    <h2>Nuevo evento enviado para revisión</h2>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rowsHtml}</table>
    ${submission.description ? `<p><strong>Descripción:</strong></p>${submission.description}` : ''}
    <p><a href="${reviewUrl}">Revisar solicitudes de eventos →</a></p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: emails,
      subject: `Nuevo evento enviado: ${submission.artist}`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Error al enviar correo de notificación de evento:', res.status, text);
  }
}

module.exports = { notifyAdminsOfEventSubmission, RESEND_API_KEY, MAIL_FROM };

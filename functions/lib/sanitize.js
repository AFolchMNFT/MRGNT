const sanitizeHtml = require('sanitize-html');

const RICH_TEXT_OPTIONS = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

function sanitizeRichText(html) {
  if (!html) return '';
  return sanitizeHtml(html, RICH_TEXT_OPTIONS).trim();
}

module.exports = { sanitizeRichText };

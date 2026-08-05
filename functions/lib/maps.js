// Turns a Google Maps link (share link, place link, or short link) into an
// embeddable iframe src using the official Maps Embed API when a key is configured,
// falling back to the no-API-key `output=embed` endpoint otherwise.
const { GOOGLE_MAPS_API_KEY } = require('../secrets');

const MAPS_HOST_RE = /(^|\.)google\.[a-z.]+$|(^|\.)goo\.gl$|(^|\.)g\.co$/i;

function extractEmbedQuery(url) {
  const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/);
  if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));

  const coordMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) return `${coordMatch[1]},${coordMatch[2]}`;

  const q = url.searchParams.get('q');
  if (q) return q;

  return null;
}

async function resolveMapsEmbedUrl(locationUrl) {
  let url;
  try {
    url = new URL(locationUrl);
  } catch {
    return null;
  }
  // Only ever follow/query Google's own domains — locationUrl is user-supplied,
  // so this keeps the server-side fetch below from being usable as an open SSRF proxy.
  if (!MAPS_HOST_RE.test(url.hostname)) return null;

  let query = extractEmbedQuery(url);

  if (!query) {
    // Short links (maps.app.goo.gl, goo.gl/maps/...) redirect to the full place URL.
    // Follow the redirect server-side since a browser can't read cross-origin redirect targets.
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      let res;
      try {
        res = await fetch(locationUrl, { redirect: 'follow', signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
      if (res.body) res.body.cancel().catch(() => {});
      query = extractEmbedQuery(new URL(res.url));
    } catch {
      return null;
    }
  }

  if (!query) return null;

  const apiKey = GOOGLE_MAPS_API_KEY.value();
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}`;
  }
  // No API key configured — fall back to the unofficial no-key embed trick.
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

module.exports = { resolveMapsEmbedUrl };

const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const app = require('./app');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('./secrets');
const { RESEND_API_KEY } = require('./lib/mail');

setGlobalOptions({ region: 'us-central1' });

const secrets = [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, RESEND_API_KEY];

exports.api = onRequest({ invoker: 'public', secrets }, app);
exports.apiDev = onRequest({ invoker: 'public', secrets }, app);

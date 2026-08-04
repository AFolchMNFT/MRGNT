const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const app = require('./app');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('./secrets');

setGlobalOptions({ region: 'us-central1' });

exports.api = onRequest({ invoker: 'public', secrets: [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET] }, app);

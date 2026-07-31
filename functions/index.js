const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const app = require('./app');

setGlobalOptions({ region: 'us-central1' });

exports.api = onRequest({ invoker: 'public' }, app);

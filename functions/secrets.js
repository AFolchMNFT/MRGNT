const { defineSecret } = require('firebase-functions/params');

const SPOTIFY_CLIENT_ID = defineSecret('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = defineSecret('SPOTIFY_CLIENT_SECRET');
const GOOGLE_MAPS_API_KEY = defineSecret('GOOGLE_MAPS_API_KEY');

module.exports = { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, GOOGLE_MAPS_API_KEY };

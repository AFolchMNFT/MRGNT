const express = require('express');
const admin = require('firebase-admin');

admin.initializeApp();

const artistsRouter = require('./routes/artists');
const eventsRouter = require('./routes/events');
const articlesRouter = require('./routes/articles');
const metaRouter = require('./routes/meta');

const app = express();
app.use(express.json());

app.use('/api/artists', artistsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/meta', metaRouter);

module.exports = app;

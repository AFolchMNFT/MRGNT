const express = require('express');
const admin = require('firebase-admin');

admin.initializeApp();

const artistsRouter = require('./routes/artists');
const eventsRouter = require('./routes/events');
const eventSubmissionsRouter = require('./routes/eventSubmissions');
const articlesRouter = require('./routes/articles');
const metaRouter = require('./routes/meta');
const spotifyRouter = require('./routes/spotify');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());

app.use('/api/artists', artistsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/event-submissions', eventSubmissionsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/meta', metaRouter);
app.use('/api/spotify', spotifyRouter);
app.use('/api/users', usersRouter);

module.exports = app;

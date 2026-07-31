require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');

const artistsRouter = require('./routes/artists');
const eventsRouter = require('./routes/events');
const articlesRouter = require('./routes/articles');
const metaRouter = require('./routes/meta');
const authRouter = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(
  cookieSession({
    name: 'mrgnt_session',
    secret: process.env.SESSION_SECRET,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
);

app.use('/api/artists', artistsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/meta', metaRouter);
app.use('/api', authRouter);

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MRGNT server listening on http://localhost:${port}`);
});

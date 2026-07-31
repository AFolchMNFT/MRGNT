const db = require('./db');
const { displayToIso } = require('./lib/dateFormat');
const { articles, events, artists } = require('./seed-data');

function seedArtists() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM artists').get();
  if (count > 0) return console.log(`artists: ${count} rows already present, skipping`);
  const insert = db.prepare('INSERT INTO artists (name, discipline, genre, featured) VALUES (@name, @discipline, @genre, @featured)');
  const insertAll = db.transaction((rows) => {
    rows.forEach((a) => insert.run({ ...a, featured: a.featured ? 1 : 0 }));
  });
  insertAll(artists);
  console.log(`artists: inserted ${artists.length} rows`);
}

function seedEvents() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM events').get();
  if (count > 0) return console.log(`events: ${count} rows already present, skipping`);
  const insert = db.prepare('INSERT INTO events (event_date, time, stage, artist, tag) VALUES (@event_date, @time, @stage, @artist, @tag)');
  const insertAll = db.transaction((rows) => {
    rows.forEach((e) => insert.run({ ...e, event_date: displayToIso(e.date) }));
  });
  insertAll(events);
  console.log(`events: inserted ${events.length} rows`);
}

function seedArticles() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM articles').get();
  if (count > 0) return console.log(`articles: ${count} rows already present, skipping`);
  const insert = db.prepare('INSERT INTO articles (slug, category, title, article_date, author, excerpt, note) VALUES (@slug, @category, @title, @article_date, @author, @excerpt, @note)');
  const insertAll = db.transaction((rows) => {
    rows.forEach((a) => insert.run({ ...a, article_date: displayToIso(a.date), note: a.note || a.excerpt }));
  });
  insertAll(articles);
  console.log(`articles: inserted ${articles.length} rows`);
}

seedArtists();
seedEvents();
seedArticles();

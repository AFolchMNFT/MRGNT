// Run from functions/: node scripts/migrate-seed-data.js
// Idempotent: skips any collection that already has documents.

const admin = require('firebase-admin');
const { articles, events, artists } = require('./seed-data');
const { displayToIso } = require('../lib/dateFormat');

admin.initializeApp();

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

async function hasData(collection) {
  const snap = await db.collection(collection).limit(1).get();
  return !snap.empty;
}

async function migrateArtists() {
  if (await hasData('artists')) {
    console.log('artists: already has data, skipping.');
    return;
  }
  for (const a of artists) {
    await db.collection('artists').add({
      name: a.name,
      discipline: a.discipline,
      genre: a.genre || '',
      featured: a.featured === true,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`artists: migrated ${artists.length} docs.`);
}

async function migrateEvents() {
  if (await hasData('events')) {
    console.log('events: already has data, skipping.');
    return;
  }
  for (const e of events) {
    await db.collection('events').add({
      event_date: displayToIso(e.date),
      time: e.time,
      stage: e.stage,
      artist: e.artist,
      tag: e.tag || '',
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`events: migrated ${events.length} docs.`);
}

async function migrateArticles() {
  if (await hasData('articles')) {
    console.log('articles: already has data, skipping.');
    return;
  }
  for (const a of articles) {
    await db.collection('articles').doc(a.slug).set({
      category: a.category,
      title: a.title,
      article_date: displayToIso(a.date),
      author: a.author,
      excerpt: a.excerpt,
      note: a.note || '',
      media: null,
      media_path: null,
      media_type: null,
    });
  }
  console.log(`articles: migrated ${articles.length} docs.`);
}

async function main() {
  await migrateArtists();
  await migrateEvents();
  await migrateArticles();
  console.log('Migration complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data', 'mrgnt.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// Migrations for databases created before these columns existed.
ensureColumn('articles', 'note', "TEXT NOT NULL DEFAULT ''");
ensureColumn('articles', 'media_path', 'TEXT');
ensureColumn('articles', 'media_type', 'TEXT');

// note became required after the column was added; backfill any pre-migration
// rows (which can only have an empty note, since the form no longer allows it).
db.exec("UPDATE articles SET note = excerpt WHERE note = ''");

module.exports = db;

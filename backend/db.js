const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH = path.join(DATA_DIR, 'meera_insights.db');
let _rawDb = null;
let _saveTimer = null;

function scheduleSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    if (_rawDb) fs.writeFileSync(DB_PATH, Buffer.from(_rawDb.export()));
  }, 150);
}

// Thin better-sqlite3-compatible wrapper around sql.js
function makeDb(rawDb) {
  return {
    exec(sql) {
      rawDb.exec(sql);
    },
    prepare(sql) {
      return {
        run(...args) {
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          rawDb.run(sql, params.length ? params : undefined);
          const rid = rawDb.exec('SELECT last_insert_rowid()');
          scheduleSave();
          return {
            lastInsertRowid: Number(rid[0]?.values[0][0] || 0),
            changes: rawDb.getRowsModified()
          };
        },
        get(...args) {
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const stmt = rawDb.prepare(sql);
          if (params.length) stmt.bind(params);
          const row = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.free();
          return row;
        },
        all(...args) {
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const rows = [];
          const stmt = rawDb.prepare(sql);
          if (params.length) stmt.bind(params);
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.free();
          return rows;
        }
      };
    }
  };
}

async function initDb() {
  const SQL = await initSqlJs();

  fs.mkdirSync(DATA_DIR, { recursive: true });

  let rawDb;
  if (fs.existsSync(DB_PATH)) {
    rawDb = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    rawDb = new SQL.Database();
  }

  rawDb.run(`CREATE TABLE IF NOT EXISTS review_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_reviews TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  rawDb.run(`CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    analysis_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  rawDb.run(`CREATE TABLE IF NOT EXISTS auto_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id INTEGER NOT NULL,
    theme TEXT NOT NULL,
    complaint_pattern TEXT NOT NULL,
    affected_reviews_count INTEGER NOT NULL,
    suggested_reply TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Persist schema immediately
  fs.writeFileSync(DB_PATH, Buffer.from(rawDb.export()));
  _rawDb = rawDb;
  return makeDb(rawDb);
}

module.exports = { initDb };

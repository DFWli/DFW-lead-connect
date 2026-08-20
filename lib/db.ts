import Database from "better-sqlite3";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __leadsDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const dbPath = path.join(process.cwd(), "data", "leads.db");
  const db = new Database(dbPath, { timeout: 10000 });
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT NOT NULL,
      source TEXT,
      message TEXT,
      lead_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      direction TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
  return db;
}

// Lazy on purpose: Next.js evaluates route modules (without invoking any
// handler) during build-time page-data collection, using several parallel
// worker processes. Opening/migrating the SQLite file at module load time
// let those workers race on the same fresh file. Deferring the connection
// until a request handler actually calls getDb() avoids that, and the
// globalThis cache still reuses one connection per warm process afterward.
export function getDb(): Database.Database {
  if (!globalThis.__leadsDb) {
    globalThis.__leadsDb = createConnection();
  }
  return globalThis.__leadsDb;
}

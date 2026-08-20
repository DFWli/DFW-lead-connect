import Database from "better-sqlite3";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __leadsDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const dbPath = path.join(process.cwd(), "data", "leads.db");
  const db = new Database(dbPath);
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
  return db;
}

// Reused across hot-reloads in dev so we don't open a new connection per request.
export const db = globalThis.__leadsDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  globalThis.__leadsDb = db;
}

import sqlite3 from 'sqlite3';
import pg from 'pg';
const { Pool } = pg;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isPostgres = !!process.env.DATABASE_URL;
let db;

if (isPostgres) {
  // PostgreSQL Connection
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('Using PostgreSQL database');
  initializePostgres();
} else {
  // SQLite Connection Fallback
  const DB_PATH = join(__dirname, 'database.db');
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Error opening SQLite database:', err.message);
    else {
      console.log('Using SQLite database');
      initializeSQLite();
    }
  });
}

// Helper for SELECT queries
export const runQuery = (sql, params = []) => {
  if (isPostgres) {
    return db.query(sql, params).then(res => res.rows);
  } else {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Helper for INSERT/UPDATE/DELETE
export const runExec = (sql, params = []) => {
  if (isPostgres) {
    return db.query(sql, params).then(res => ({
      id: res.rows[0]?.id,
      changes: res.rowCount,
      rows: res.rows
    }));
  } else {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

// --- Initialization Logic ---

async function initializePostgres() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Personal',
        status TEXT DEFAULT 'active',
        priority TEXT DEFAULT 'medium',
        due_date TIMESTAMP,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('PostgreSQL schema verified');
  } catch (err) {
    console.error('PostgreSQL Initialization Error:', err.message);
  }
}

function initializeSQLite() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TEXT NOT NULL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Personal',
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
        due_date TEXT,
        user_id INTEGER REFERENCES users(id),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  });
}

export default db;

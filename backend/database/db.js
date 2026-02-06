// database/db.js
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'safeguard.db');
let db;

async function initDatabase() {
  console.log('📦 Loading sql.js...');
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    console.log('📂 Loading existing database...');
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Database loaded');
  } else {
    console.log('🆕 Creating new database...');
    db = new SQL.Database();
    createTables();
    console.log('✅ New database created');
  }
  
  return db;
}

function createTables() {
  console.log('📋 Creating tables...');

  // Parents table
  db.run(`
    CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      family_code TEXT UNIQUE NOT NULL,
      phone_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Children table
  db.run(`
    CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      device_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    )
  `);

  // Incidents table
  db.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      platform TEXT,
      severity TEXT DEFAULT 'medium',
      flagged BOOLEAN DEFAULT 1,
      audio_path TEXT,
      detected_keywords TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed BOOLEAN DEFAULT 0,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    )
  `);

  saveDatabase();
  console.log('✅ Tables created');
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Auto-save every 5 seconds
setInterval(() => {
  if (db) {
    saveDatabase();
  }
}, 5000);

// Save on exit
process.on('exit', () => {
  saveDatabase();
  console.log('💾 Database saved on exit');
});

process.on('SIGINT', () => {
  saveDatabase();
  console.log('\n💾 Database saved');
  process.exit();
});

module.exports = { 
  initDatabase, 
  saveDatabase, 
  getDb 
};
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

// Children table (updated structure)
db.run(`
  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    device_id TEXT UNIQUE NOT NULL,
    device_info TEXT,
    parent_id INTEGER NOT NULL,
    family_code TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
  )
`);

  // Incidents table
 db.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL,
      child_name TEXT NOT NULL,
      parent_id INTEGER NOT NULL,
      family_code TEXT NOT NULL,
      message TEXT NOT NULL,
      sender TEXT,
      source TEXT,
      severity TEXT DEFAULT 'MEDIUM',
      confidence REAL DEFAULT 0.5,
      status TEXT DEFAULT 'new',
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
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
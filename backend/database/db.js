// database/db.js
const mysql = require('mysql2/promise');

let pool;

// ⚠️ CONFIGURATION MySQL - Modifiez selon votre installation
const dbConfig = {
  host: 'localhost',
  user: 'root',              // Votre username MySQL
  password: '',              // Votre password MySQL (vide par défaut sur XAMPP/WAMP)
  database: 'safeguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

async function initDatabase() {
  try {
    console.log('📦 Connecting to MySQL...');
    
    // Créer la base de données si elle n'existe pas
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    await tempConnection.end();
    
    // Créer le pool de connexions
    pool = mysql.createPool(dbConfig);
    
    console.log('✅ MySQL connected');
    
    // Créer les tables
    await createTables();
    
    return pool;
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    console.error('   Make sure MySQL is running and credentials are correct');
    throw error;
  }
}

async function createTables() {
  console.log('📋 Creating tables...');
  
  const connection = await pool.getConnection();
  
  try {
    // Parents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        family_code VARCHAR(50) UNIQUE NOT NULL,
        phone_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_family_code (family_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Table parents created');
    
    // Children table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS children (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT,
        device_id VARCHAR(255) UNIQUE NOT NULL,
        device_info TEXT,
        parent_id INT NOT NULL,
        family_code VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        INDEX idx_parent_id (parent_id),
        INDEX idx_family_code (family_code),
        INDEX idx_device_id (device_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Table children created');
    
    // Incidents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        child_id INT NOT NULL,
        child_name VARCHAR(100) NOT NULL,
        parent_id INT NOT NULL,
        family_code VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        sender VARCHAR(255),
        source VARCHAR(100),
        severity VARCHAR(20) DEFAULT 'MEDIUM',
        confidence DECIMAL(3,2) DEFAULT 0.5,
        status VARCHAR(20) DEFAULT 'new',
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        INDEX idx_child_id (child_id),
        INDEX idx_parent_id (parent_id),
        INDEX idx_status (status),
        INDEX idx_detected_at (detected_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Table incidents created');
    
    console.log('✅ All tables ready');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
}

function getDb() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

// Helper function pour exécuter des requêtes simples
async function query(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

// Fonction saveDatabase() pour compatibilité (MySQL sauvegarde automatiquement)
function saveDatabase() {
  // MySQL sauvegarde automatiquement, pas besoin d'action
  // Cette fonction existe juste pour la compatibilité avec l'ancien code
}

// Fermeture propre de la connexion
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (pool) {
    await pool.end();
    console.log('💾 MySQL connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

// Export
module.exports = { 
  initDatabase, 
  saveDatabase,  // Garde pour compatibilité
  getDb,
  query
};
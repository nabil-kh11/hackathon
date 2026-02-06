// services/ParentService.js
const Parent = require('../entities/Parent');
const { getDb, saveDatabase } = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

class ParentService {
  
  // Generate unique family code
  generateFamilyCode() {
    const prefix = 'SAFE';
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-${random}`;
  }

  // Check if email already exists
  emailExists(email) {
    const db = getDb();
    const result = db.exec('SELECT id FROM parents WHERE email = ?', [email]);
    return result.length > 0 && result[0].values.length > 0;
  }

  // Register new parent
  register(name, lastName, email, password, phoneNumber) {
    const db = getDb();

    // Validate email doesn't exist
    if (this.emailExists(email)) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate unique family code
    const familyCode = this.generateFamilyCode();

    // Insert into database
    db.run(
      `INSERT INTO parents (name, last_name, email, password, family_code, phone_number) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, lastName, email, hashedPassword, familyCode, phoneNumber]
    );

    // Get the inserted ID
    const result = db.exec('SELECT last_insert_rowid() as id');
    const parentId = result[0].values[0][0];

    saveDatabase();

    // Return the created parent (without password)
    return this.findById(parentId);
  }

  // Login parent
  login(email, password) {
    const db = getDb();

    // Find parent by email
    const result = db.exec('SELECT * FROM parents WHERE email = ?', [email]);

    if (result.length === 0 || result[0].values.length === 0) {
      throw new Error('Invalid email or password');
    }

    // Convert to object
    const row = this.rowToObject(result[0]);
    
    // Check password
    const isValidPassword = bcrypt.compareSync(password, row.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: row.id,
        email: row.email,
        familyCode: row.family_code
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Get parent entity
    const parent = Parent.fromRow(row);
    
    // Return as JSON with token
    return {
      id: parent.getId(),
      name: parent.getName(),
      lastName: parent.getLastName(),
      email: parent.getEmail(),
      familyCode: parent.getFamilyCode(),
      phoneNumber: parent.getPhoneNumber(),
      createdAt: parent.getCreatedAt(),
      token: token
    };
  }

  // Find parent by ID
  findById(id) {
    const db = getDb();
    const result = db.exec('SELECT * FROM parents WHERE id = ?', [id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = this.rowToObject(result[0]);
    return Parent.fromRow(row);
  }

  // Find parent by email
  findByEmail(email) {
    const db = getDb();
    const result = db.exec('SELECT * FROM parents WHERE email = ?', [email]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = this.rowToObject(result[0]);
    return Parent.fromRow(row);
  }

  // Find parent by family code
  findByFamilyCode(familyCode) {
    const db = getDb();
    const result = db.exec('SELECT * FROM parents WHERE family_code = ?', [familyCode]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = this.rowToObject(result[0]);
    return Parent.fromRow(row);
  }

  // Update parent profile
  updateProfile(id, name, lastName, phoneNumber) {
    const db = getDb();
    
    db.run(
      `UPDATE parents 
       SET name = ?, last_name = ?, phone_number = ? 
       WHERE id = ?`,
      [name, lastName, phoneNumber, id]
    );

    saveDatabase();
    return this.findById(id);
  }

  // Get all parents (admin only)
  findAll() {
    const db = getDb();
    const result = db.exec('SELECT * FROM parents');
    
    if (result.length === 0) {
      return [];
    }

    const parents = [];
    const columns = result[0].columns;
    const values = result[0].values;

    values.forEach(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      parents.push(Parent.fromRow(obj));
    });

    return parents;
  }

  // Helper: Convert SQL result to object
  rowToObject(result) {
    const columns = result.columns;
    const values = result.values[0];
    const obj = {};
    
    columns.forEach((col, index) => {
      obj[col] = values[index];
    });
    
    return obj;
  }
}

module.exports = new ParentService();
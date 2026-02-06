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
  async emailExists(email) {
    const db = getDb();
    const [rows] = await db.query('SELECT id FROM parents WHERE email = ?', [email]);
    return rows.length > 0;
  }

  // Register new parent
  async register(name, lastName, email, password, phoneNumber) {
    const db = getDb();

    // Validate email doesn't exist
    const exists = await this.emailExists(email);
    if (exists) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate unique family code
    const familyCode = this.generateFamilyCode();

    // Insert into database
    const [result] = await db.query(
      `INSERT INTO parents (name, last_name, email, password, family_code, phone_number) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, lastName, email, hashedPassword, familyCode, phoneNumber]
    );

    console.log(`✅ Parent registered with ID: ${result.insertId}`);

    // Return the created parent (without password)
    return this.findById(result.insertId);
  }

  // Login parent
  async login(email, password) {
    const db = getDb();

    // Find parent by email
    const [rows] = await db.query('SELECT * FROM parents WHERE email = ?', [email]);

    if (rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const row = rows[0];
    
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
  async findById(id) {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM parents WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }

    return Parent.fromRow(rows[0]);
  }

  // Find parent by email
  async findByEmail(email) {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM parents WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return null;
    }

    return Parent.fromRow(rows[0]);
  }

  // Find parent by family code
  async findByFamilyCode(familyCode) {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM parents WHERE family_code = ?', [familyCode]);
    
    if (rows.length === 0) {
      return null;
    }

    return Parent.fromRow(rows[0]);
  }

  // Update parent profile
  async updateProfile(id, name, lastName, phoneNumber) {
    const db = getDb();
    
    await db.query(
      `UPDATE parents 
       SET name = ?, last_name = ?, phone_number = ? 
       WHERE id = ?`,
      [name, lastName, phoneNumber, id]
    );

    console.log(`✅ Parent ${id} profile updated`);
    return this.findById(id);
  }

  // Get all parents (admin only)
  async findAll() {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM parents ORDER BY created_at DESC');
    
    return rows.map(row => Parent.fromRow(row));
  }
}

module.exports = new ParentService();
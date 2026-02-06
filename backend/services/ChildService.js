// services/ChildService.js
const { getDb, saveDatabase } = require('../database/db');

class ChildService {

  // Connect child to parent via family code
  async connect(familyCode, childName, age, deviceId, deviceInfo = null) {
    const db = getDb();

    // Find parent by family code
    const [parentRows] = await db.query(
      'SELECT id FROM parents WHERE family_code = ?',
      [familyCode]
    );

    if (parentRows.length === 0) {
      throw new Error('Invalid family code');
    }

    const parentId = parentRows[0].id;

    // Check if device already connected
    const [existingDevice] = await db.query(
      'SELECT id FROM children WHERE device_id = ?',
      [deviceId]
    );

    if (existingDevice.length > 0) {
      throw new Error('Device already connected');
    }

    // Insert child
    const [result] = await db.query(
      `INSERT INTO children (name, age, device_id, device_info, parent_id, family_code, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [childName, age || null, deviceId, deviceInfo || '', parentId, familyCode]
    );

    console.log(`✅ Child connected with ID: ${result.insertId}`);

    // Return the created child
    return this.findById(result.insertId);
  }

  // Find child by family code and name
  async findByFamilyCodeAndName(familyCode, childName) {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT * FROM children WHERE family_code = ? AND LOWER(name) = LOWER(?)',
      [familyCode, childName]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  // Create child directly (for parent manual add)
  async create(childName, age, deviceId, deviceInfo, parentId, familyCode) {
    const db = getDb();

    // Check if device already exists
    const [existingDevice] = await db.query(
      'SELECT id FROM children WHERE device_id = ?',
      [deviceId]
    );

    if (existingDevice.length > 0) {
      throw new Error('Device already connected');
    }

    // Insert child
    const [result] = await db.query(
      `INSERT INTO children (name, age, device_id, device_info, parent_id, family_code, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [childName, age || null, deviceId, deviceInfo || '', parentId, familyCode]
    );

    console.log(`✅ Child created with ID: ${result.insertId}`);

    // Return the created child
    return this.findById(result.insertId);
  }

  // Find child by ID
  async findById(id) {
    const db = getDb();
    const [rows] = await db.query(
      'SELECT * FROM children WHERE id = ?',
      [parseInt(id)]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  // Get all children for a parent
  async findByParentId(parentId) {
    const db = getDb();
    const [rows] = await db.query(
      'SELECT * FROM children WHERE parent_id = ? ORDER BY connected_at DESC',
      [parseInt(parentId)]
    );

    return rows;
  }

  // Update child status
  async updateStatus(id, status) {
    const db = getDb();
    
    await db.query(
      'UPDATE children SET status = ?, last_seen = NOW() WHERE id = ?',
      [status, parseInt(id)]
    );

    console.log(`✅ Child ${id} status updated to: ${status}`);
    return this.findById(id);
  }

  // Remove child
  async remove(id) {
    const db = getDb();
    
    await db.query('DELETE FROM children WHERE id = ?', [parseInt(id)]);
    
    console.log(`✅ Child ${id} removed`);
    return true;
  }

  // Get children count for parent
  async countByParentId(parentId) {
    const db = getDb();
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM children WHERE parent_id = ?',
      [parseInt(parentId)]
    );

    return rows[0].count;
  }
}

module.exports = new ChildService();
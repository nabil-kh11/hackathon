// services/ChildService.js
const { getDb, saveDatabase } = require('../database/db');

class ChildService {

  // Connect child to parent via family code
  connect(familyCode, childName, age, deviceId, deviceInfo = null) {
    const db = getDb();

    // Find parent by family code
    const parentResult = db.exec(
      'SELECT id FROM parents WHERE family_code = ?',
      [familyCode]
    );

    if (parentResult.length === 0 || parentResult[0].values.length === 0) {
      throw new Error('Invalid family code');
    }

    const parentId = parentResult[0].values[0][0];

    // Check if device already connected
    const existingDevice = db.exec(
      'SELECT id FROM children WHERE device_id = ?',
      [deviceId]
    );

    if (existingDevice.length > 0 && existingDevice[0].values.length > 0) {
      throw new Error('Device already connected');
    }

    // Insert child
    db.run(
      `INSERT INTO children (name, age, device_id, device_info, parent_id, family_code, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [childName, age || null, deviceId, deviceInfo || '', parentId, familyCode]
    );

    // Get the inserted child
    const result = db.exec('SELECT last_insert_rowid() as id');
    const childId = result[0].values[0][0];

    saveDatabase();

    return this.findById(childId);
  }


// Find child by family code and name
findByFamilyCodeAndName(familyCode, childName) {
  const db = getDb();
  
  const result = db.exec(
    'SELECT * FROM children WHERE family_code = ? AND name = ? COLLATE NOCASE',
    [familyCode, childName]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  return this.rowToObject(result[0]);
}



  // ✅ NEW METHOD: Create child directly (for parent manual add)
  create(childName, age, deviceId, deviceInfo, parentId, familyCode) {
    const db = getDb();

    // Check if device already exists
    const existingDevice = db.exec(
      'SELECT id FROM children WHERE device_id = ?',
      [deviceId]
    );

    if (existingDevice.length > 0 && existingDevice[0].values.length > 0) {
      throw new Error('Device already connected');
    }

    // Insert child
    db.run(
      `INSERT INTO children (name, age, device_id, device_info, parent_id, family_code, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [childName, age || null, deviceId, deviceInfo || '', parentId, familyCode]
    );

    // Get the inserted child
    const result = db.exec('SELECT last_insert_rowid() as id');
    const childId = result[0].values[0][0];

    saveDatabase();

    return this.findById(childId);
  }

  // Find child by ID
  findById(id) {
    const db = getDb();
    const result = db.exec(
      'SELECT * FROM children WHERE id = ?',
      [parseInt(id)]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToObject(result[0]);
  }

  // Get all children for a parent
  findByParentId(parentId) {
    const db = getDb();
    const result = db.exec(
      'SELECT * FROM children WHERE parent_id = ? ORDER BY connected_at DESC',
      [parseInt(parentId)]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
  }






  // Update child status
  updateStatus(id, status) {
    const db = getDb();
    
    db.run(
      'UPDATE children SET status = ?, last_seen = datetime("now") WHERE id = ?',
      [status, parseInt(id)]
    );

    saveDatabase();
    return this.findById(id);
  }

  // Remove child
  remove(id) {
    const db = getDb();
    
    db.run('DELETE FROM children WHERE id = ?', [parseInt(id)]);
    
    saveDatabase();
    return true;
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

module.exports = new ChildService();
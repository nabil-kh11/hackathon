// entities/Parent.js
class Parent {
  constructor(id, name, lastName, email, password, familyCode, phoneNumber, createdAt) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.familyCode = familyCode;
    this.phoneNumber = phoneNumber;
    this.createdAt = createdAt || new Date();
  }

  // Getters
  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getLastName() {
    return this.lastName;
  }

  getEmail() {
    return this.email;
  }

  getFamilyCode() {
    return this.familyCode;
  }

  getPhoneNumber() {
    return this.phoneNumber;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  // Setters
  setName(name) {
    this.name = name;
  }

  setLastName(lastName) {
    this.lastName = lastName;
  }

  setEmail(email) {
    this.email = email;
  }

  setPhoneNumber(phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  // Convert to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      familyCode: this.familyCode,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt
    };
  }

  // Create from database row
  static fromRow(row) {
    return new Parent(
      row.id,
      row.name,
      row.last_name,
      row.email,
      row.password,
      row.family_code,
      row.phone_number,
      row.created_at
    );
  }
}

module.exports = Parent;
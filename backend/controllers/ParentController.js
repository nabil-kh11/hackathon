// controllers/ParentController.js
const ParentService = require('../services/ParentService');

class ParentController {
  
  // POST /api/parents/register
  async register(req, res) {
    try {
      const { name, lastName, email, password, phoneNumber } = req.body;

      // Validation
      if (!name || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, lastName, email and password are required'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Password length validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      // Register parent
      const parent = ParentService.register(name, lastName, email, password, phoneNumber);

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Parent registered successfully',
        data: {
          id: parent.getId(),
          name: parent.getName(),
          lastName: parent.getLastName(),
          email: parent.getEmail(),
          familyCode: parent.getFamilyCode(),
          phoneNumber: parent.getPhoneNumber(),
          createdAt: parent.getCreatedAt()
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  }

  // POST /api/parents/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Login
      const parent = ParentService.login(email, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: parent.getId(),
          name: parent.getName(),
          lastName: parent.getLastName(),
          email: parent.getEmail(),
          familyCode: parent.getFamilyCode(),
          phoneNumber: parent.getPhoneNumber()
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials'
      });
    }
  }

  // GET /api/parents/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const parent = ParentService.findById(parseInt(id));

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: parent.toJSON()
      });

    } catch (error) {
      console.error('Get parent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // GET /api/parents/family-code/:code
  async getByFamilyCode(req, res) {
    try {
      const { code } = req.params;
      const parent = ParentService.findByFamilyCode(code);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Invalid family code'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          name: parent.getName(),
          lastName: parent.getLastName(),
          email: parent.getEmail()
        }
      });

    } catch (error) {
      console.error('Get by family code error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // PUT /api/parents/:id
  async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, lastName, phoneNumber } = req.body;

      const parent = ParentService.updateProfile(
        parseInt(id),
        name,
        lastName,
        phoneNumber
      );

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: parent.toJSON()
      });

    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // GET /api/parents (admin only - for testing)
  async getAll(req, res) {
    try {
      const parents = ParentService.findAll();

      return res.status(200).json({
        success: true,
        count: parents.length,
        data: parents.map(p => p.toJSON())
      });

    } catch (error) {
      console.error('Get all parents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new ParentController();
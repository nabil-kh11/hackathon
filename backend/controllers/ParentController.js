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

      // Register parent (await!)
      const parent = await ParentService.register(name, lastName, email, password, phoneNumber);

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

      // Login - returns plain object with token (await!)
      const parentData = await ParentService.login(email, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: parentData // Already includes token
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
      const parent = await ParentService.findById(parseInt(id));

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
      const parent = await ParentService.findByFamilyCode(code);

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

      const parent = await ParentService.updateProfile(
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
      const parents = await ParentService.findAll();

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

  // GET /api/parents/:id/dashboard
  async getDashboard(req, res) {
    try {
      const { id } = req.params;
      const { getDb } = require('../database/db');
      const db = getDb();

      console.log(`📊 Getting dashboard for parent ${id}`);

      // Get children count (MySQL query)
      const [childrenRows] = await db.query(
        'SELECT COUNT(*) as count FROM children WHERE parent_id = ?',
        [parseInt(id)]
      );
      const childrenCount = childrenRows[0].count;

      // Get incidents count (MySQL query)
      const [incidentsRows] = await db.query(
        'SELECT COUNT(*) as count FROM incidents WHERE parent_id = ?',
        [parseInt(id)]
      );
      const incidentsCount = incidentsRows[0].count;

      console.log(`✅ Dashboard: ${childrenCount} children, ${incidentsCount} incidents`);

      return res.status(200).json({
        success: true,
        data: {
          childrenCount,
          incidentsCount
        }
      });

    } catch (error) {
      console.error('❌ Get dashboard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // GET /api/parents/:id/children
  async getChildren(req, res) {
    try {
      const { id } = req.params;
      const ChildService = require('../services/ChildService');

      console.log(`👶 Getting children for parent ${id}`);

      const children = await ChildService.findByParentId(id);

      console.log(`✅ Found ${children.length} children`);

      return res.status(200).json({
        success: true,
        count: children.length,
        data: children
      });

    } catch (error) {
      console.error('❌ Get children error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new ParentController();
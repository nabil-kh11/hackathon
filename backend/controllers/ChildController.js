// controllers/ChildController.js
const ChildService = require('../services/ChildService');

class ChildController {

  // POST /api/children/login - Child login ✅ NOUVEAU
  async childLogin(req, res) {
    try {
      const { familyCode, childName } = req.body;

      console.log('👶 Child login request:', { familyCode, childName });

      // Validation
      if (!familyCode || !childName) {
        return res.status(400).json({
          success: false,
          message: 'Family code and child name are required'
        });
      }

      // Find child by family code AND name
      const child = ChildService.findByFamilyCodeAndName(familyCode, childName);

      if (!child) {
        return res.status(404).json({
          success: false,
          message: 'Child not found with this family code and name'
        });
      }

      // Update last seen
      ChildService.updateStatus(child.id, 'active');

      console.log('✅ Child logged in:', child);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: child.id,
          name: child.name,
          age: child.age,
          familyCode: child.family_code,
          parentId: child.parent_id,
          deviceId: child.device_id,
          status: child.status
        }
      });

    } catch (error) {
      console.error('❌ Child login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // POST /api/children/connect
  async connect(req, res) {
    try {
      const { familyCode, childName, age, deviceId, deviceInfo } = req.body;

      console.log('📱 Child connection request:', { familyCode, childName, deviceId });

      // Validation
      if (!familyCode || !childName || !deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Family code, child name, and device ID are required'
        });
      }

      // Connect child
      const child = ChildService.connect(
        familyCode,
        childName,
        age,
        deviceId,
        deviceInfo
      );

      console.log('✅ Child connected:', child);

      return res.status(201).json({
        success: true,
        message: 'Child connected successfully',
        data: child
      });

    } catch (error) {
      console.error('❌ Connect child error:', error);
      
      if (error.message === 'Invalid family code') {
        return res.status(404).json({
          success: false,
          message: 'Invalid family code'
        });
      }

      if (error.message === 'Device already connected') {
        return res.status(409).json({
          success: false,
          message: 'Device already connected'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // POST /api/children/add - Parent manually adds child
  async addChild(req, res) {
    try {
      const { parentId, childName, age, deviceId, deviceInfo } = req.body;

      console.log('👶 Manual add child request:', { parentId, childName, deviceId });

      // Validation
      if (!parentId || !childName || !deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Parent ID, child name, and device ID are required'
        });
      }

      // Get parent to get family code
      const ParentService = require('../services/ParentService');
      const parent = ParentService.findById(parentId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      const familyCode = parent.getFamilyCode();

      // Create child
      const child = ChildService.create(
        childName,
        age,
        deviceId,
        deviceInfo || '',
        parentId,
        familyCode
      );

      console.log('✅ Child added manually:', child);

      return res.status(201).json({
        success: true,
        message: 'Child added successfully',
        data: child
      });

    } catch (error) {
      console.error('❌ Add child error:', error);
      
      if (error.message === 'Device already connected') {
        return res.status(409).json({
          success: false,
          message: 'Device ID already in use'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // GET /api/children/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const child = ChildService.findById(id);

      if (!child) {
        return res.status(404).json({
          success: false,
          message: 'Child not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: child
      });

    } catch (error) {
      console.error('❌ Get child error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // DELETE /api/children/:id
  async remove(req, res) {
    try {
      const { id } = req.params;
      
      const child = ChildService.findById(id);
      if (!child) {
        return res.status(404).json({
          success: false,
          message: 'Child not found'
        });
      }

      ChildService.remove(id);

      console.log(`✅ Child ${id} removed`);

      return res.status(200).json({
        success: true,
        message: 'Child removed successfully'
      });

    } catch (error) {
      console.error('❌ Remove child error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new ChildController();
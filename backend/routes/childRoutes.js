
// routes/childRoutes.js
const express = require('express');
const router = express.Router();
const ChildController = require('../controllers/ChildController');

// POST /api/children/login - Child login ✅ NOUVEAU
router.post('/login', (req, res) => ChildController.childLogin(req, res));

// POST /api/children/connect - Connect child via family code
router.post('/connect', (req, res) => ChildController.connect(req, res));

// POST /api/children/add - Parent manually adds child (MUST BE BEFORE /:id)
router.post('/add', (req, res) => ChildController.addChild(req, res));

// GET /api/children/:id - Get child by ID (AFTER specific routes)
router.get('/:id', (req, res) => ChildController.getById(req, res));

// DELETE /api/children/:id - Remove child
router.delete('/:id', (req, res) => ChildController.remove(req, res));

module.exports = router;
// routes/parentRoutes.js
const express = require('express');
const router = express.Router();
const ParentController = require('../controllers/ParentController');

// POST /api/parents/register - Register new parent
router.post('/register', (req, res) => ParentController.register(req, res));

// POST /api/parents/login - Login
router.post('/login', (req, res) => ParentController.login(req, res));

// GET /api/parents/:id - Get parent by ID
router.get('/:id', (req, res) => ParentController.getById(req, res));

// GET /api/parents/family-code/:code - Get parent by family code
router.get('/family-code/:code', (req, res) => ParentController.getByFamilyCode(req, res));

// PUT /api/parents/:id - Update parent profile
router.put('/:id', (req, res) => ParentController.updateProfile(req, res));

// GET /api/parents - Get all parents (for testing)
router.get('/', (req, res) => ParentController.getAll(req, res));

module.exports = router;
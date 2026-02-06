// server.js
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
let dbInitialized = false;

async function startServer() {
  try {
    // Initialize database
    console.log('🔄 Initializing database...');
    await initDatabase();
    dbInitialized = true;
    console.log('✅ Database initialized');

    // Import routes ✅ BOTH HERE
    const parentRoutes = require('./routes/parentRoutes');
    const childRoutes = require('./routes/childRoutes');

    // Use routes ✅ BOTH HERE
    app.use('/api/parents', parentRoutes);
    app.use('/api/children', childRoutes);  // ✅ MOVED HERE!

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'SafeGuard API is running',
        database: dbInitialized ? 'connected' : 'disconnected'
      });
    });

    // Root route
    app.get('/', (req, res) => {
      res.json({
        message: '🛡️ SafeGuard API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          parents: '/api/parents',
          children: '/api/children',
          register: 'POST /api/parents/register',
          login: 'POST /api/parents/login',
          addChild: 'POST /api/children/add'
        }
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 SafeGuard Backend Started');
      console.log('═══════════════════════════════════════');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log('   Parents:');
      console.log(`     POST http://localhost:${PORT}/api/parents/register`);
      console.log(`     POST http://localhost:${PORT}/api/parents/login`);
      console.log(`     GET  http://localhost:${PORT}/api/parents/:id`);
      console.log('   Children:');
      console.log(`     POST http://localhost:${PORT}/api/children/add`);
      console.log(`     POST http://localhost:${PORT}/api/children/connect`);
      console.log(`     GET  http://localhost:${PORT}/api/children/:id`);
      console.log(`     DELETE http://localhost:${PORT}/api/children/:id`);
      console.log('   Health:');
      console.log(`     GET  http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════');
      console.log('✅ CORS enabled for all origins');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
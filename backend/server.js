const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const wardrobeRoutes = require('./src/routes/wardrobeRoutes');
const outfitRoutes = require('./src/routes/outfitRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const userRoutes = require('./src/routes/userRoutes');
const userController = require('./src/controllers/userController');
const authenticateToken = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'wearlyourfit API',
    tagline: 'Your wardrobe, planned beautifully.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);

// Home summary route
app.get('/api/home/summary', authenticateToken, userController.getHomeSummary);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Initialize DB and start server
async function startServer() {
  try {
    await initDb();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`✨ wearlyourfit REST API Server running on port ${PORT}`);
      console.log(`✨ Base URL: http://localhost:${PORT}`);
      console.log(`✨ Tagline: Your wardrobe, planned beautifully.`);
      console.log(`====================================================`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.app = app;
module.exports.startServer = startServer;

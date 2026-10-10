/**
 * Online Certificate Request System (OCRS) - Backend Server Entry
 * Express Application with MongoDB & REST APIs
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allows requests from configured Frontend URL or all origins in development
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded student documents and generated certificates
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// Base Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Online Certificate Request System (OCRS) API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Import API route modules
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const requestController = require('./controllers/requestController');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/student', studentRoutes);
app.get('/api/certificate-types/eligible', requestController.getEligibleTypes);

// 404 Not Found Handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Error caught by Global Handler]:', err.stack || err.message || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Connect to MongoDB and start listening
connectDB().then(async () => {
  const { seedCertificateTypes } = require('./models/store');
  await seedCertificateTypes();
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  OCRS Server running on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Frontend URL: ${allowedOrigin}`);
    console.log(`====================================================`);
  });
}

module.exports = app;

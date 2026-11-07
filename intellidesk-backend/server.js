require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./src/routes/auth.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const incidentsRoutes = require('./src/routes/incidents.routes');
const aiRoutes = require('./src/routes/ai.routes');
const logsRoutes = require('./src/routes/logs.routes');
const historicalRoutes = require('./src/routes/historical.routes');
const knowledgeBaseRoutes = require('./src/routes/knowledgeBase.routes');
const { initPgPool, isPgConnected } = require('./src/data/pgClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable Permissive CORS for any origin (supports file://, localhost:3000, Vite dev ports, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// HTTP Request Logger
app.use(morgan('dev'));

// Large payload body parsers (supports up to 50MB for raw log file uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'IntelliDesk Backend API',
    version: '1.0.0',
    database: isPgConnected() ? 'postgresql' : 'json-store',
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IntelliDesk Backend API v1',
    timestamp: new Date().toISOString(),
    database: isPgConnected() ? 'postgresql' : 'json-store',
  });
});

// API Routes Mounting (/api/v1/*)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/incidents', incidentsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/logs', logsRoutes);
app.use('/api/v1/historical', historicalRoutes);
app.use('/api/v1/knowledge-base', knowledgeBaseRoutes);

// Static frontend delivery
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      status: 'error',
      message: `API endpoint ${req.method} ${req.path} not found.`,
    });
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Internal Server Error]', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

// Start Server only when run directly
if (require.main === module) {
  initPgPool().finally(() => {
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 IntelliDesk Backend Server running on port ${PORT}`);
      console.log(`📡 API Base URL:       http://localhost:${PORT}/api/v1`);
      console.log(`🌐 Frontend UI URL:    http://localhost:${PORT}`);
      console.log(`🩺 Health Check:       http://localhost:${PORT}/api/health`);
      console.log(`💾 Active Database:    ${isPgConnected() ? 'PostgreSQL' : 'Local JSON Store'}`);
      console.log('====================================================');
    });
  });
}

module.exports = app;

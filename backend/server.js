import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/tasks.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import './database.js'; // Initialize database

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Middleware
const VERCEL_URL = 'https://todo-app-production-six.vercel.app';
app.use(cors({
  origin: [VERCEL_URL, 'http://localhost:5173'], // Explicit origins for token safety
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request Logger (For mobile debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User-Agent: ${req.headers['user-agent']}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check and root endpoints
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the TODO API Production Server!', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TODO API server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('--- GLOBAL ERROR ---');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Query:', req.query);
  console.error('Headers:', req.headers);
  console.error('Stack:', err.stack);
  console.error('---------------------');
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   TODO API Server Running            ║
║   Port: ${PORT}                       ║
║   Health: http://localhost:${PORT}/api/health
╚══════════════════════════════════════╝
  `);
});

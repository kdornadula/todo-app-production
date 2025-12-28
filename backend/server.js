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
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TODO API server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
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

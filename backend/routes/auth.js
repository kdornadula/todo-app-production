import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { runQuery, runExec } from '../database.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register - Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUsers = await runQuery('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const now = new Date().toISOString();

      // Create user
      const isPostgres = !!process.env.DATABASE_URL;
      const sql = isPostgres 
        ? 'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, $4) RETURNING id'
        : 'INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)';
      
      const result = await runExec(sql, [email, passwordHash, name || null, now]);

      // Generate JWT
      const token = jwt.sign(
        { id: result.id, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Return user (without password) and token
      res.status(201).json({
        user: {
          id: result.id,
          email,
          name: name || null
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// POST /api/auth/login - Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find user
      const users = await runQuery('SELECT * FROM users WHERE email = $1', [email]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Return user (without password) and token
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await runQuery('SELECT id, email, name, created_at FROM users WHERE id = $1', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;

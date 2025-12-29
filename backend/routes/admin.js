import express from 'express';
import bcrypt from 'bcryptjs';
import { runQuery, runExec } from '../database.js';

const router = express.Router();
const ADMIN_KEY = process.env.ADMIN_KEY;

// Middleware: Check for Admin Key
const requireAdmin = (req, res, next) => {
  const providedKey = req.headers['x-admin-key'];
  if (!ADMIN_KEY || providedKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Access Denied: Invalid Admin Key' });
  }
  next();
};

router.use(requireAdmin);

// GET /api/admin/users - List all users with stats
router.get('/users', async (req, res) => {
  try {
    const isPostgres = !!process.env.DATABASE_URL;
    
    const sql = isPostgres
      ? `SELECT 
           u.id, 
           u.email, 
           u.name, 
           u.created_at,
           COUNT(t.id) as task_count 
         FROM users u
         LEFT JOIN tasks t ON u.id = t.user_id
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      : `SELECT 
           u.id, 
           u.email, 
           u.name, 
           u.created_at,
           COUNT(t.id) as task_count 
         FROM users u
         LEFT JOIN tasks t ON u.id = t.user_id
         GROUP BY u.id
         ORDER BY u.created_at DESC`;

    const users = await runQuery(sql);
    
    // Parse counts (Postgres returns strings)
    users.forEach(u => u.task_count = parseInt(u.task_count || 0));

    res.json(users);
  } catch (error) {
    console.error('Admin List Users Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Delete user's tasks first (Cascade)
    await runExec('DELETE FROM tasks WHERE user_id = $1', [userId]);

    // 2. Delete the user
    await runExec('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:id/reset-password - Reset user password to default
router.patch('/users/:id/reset-password', async (req, res) => {
  try {
    const userId = req.params.id;
    const defaultPassword = '12345678';
    
    // Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Update user
    await runExec('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ success: true, message: `Password reset to ${defaultPassword}` });
  } catch (error) {
    console.error('Admin Reset Password Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

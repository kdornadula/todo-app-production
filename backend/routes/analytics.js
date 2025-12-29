import express from 'express';
import { runQuery } from '../database.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/analytics/summary - Get high-level stats
router.get('/summary', async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    
    // Status distribution
    const statusStats = await runQuery(
      'SELECT status, COUNT(*) as count FROM tasks WHERE user_id = $1 GROUP BY status',
      [userId]
    );

    // Category distribution
    const categoryStats = await runQuery(
      'SELECT category, COUNT(*) as count FROM tasks WHERE user_id = $1 GROUP BY category',
      [userId]
    );

    // Completion trend (last 7 days)
    const isPostgres = !!process.env.DATABASE_URL;
    const trendSql = isPostgres
      ? `SELECT 
           updated_at::date as date,
           COUNT(*) as count
         FROM tasks 
         WHERE user_id = $1 AND status = 'completed' AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY updated_at::date
         ORDER BY date ASC`
      : `SELECT 
           date(updated_at) as date,
           COUNT(*) as count
         FROM tasks 
         WHERE user_id = ? AND status = 'completed' AND updated_at >= date('now', '-7 days')
         GROUP BY date(updated_at)
         ORDER BY date ASC`;

    const trendStats = await runQuery(trendSql, [userId]);

    // Parse counts to integers (Postgres returns strings for COUNT)
    statusStats.forEach(row => row.count = parseInt(row.count));
    categoryStats.forEach(row => row.count = parseInt(row.count));
    trendStats.forEach(row => row.count = parseInt(row.count));

    res.json({
      status: statusStats,
      category: categoryStats,
      categories: categoryStats, // Redundant key for compatibility
      trend: trendStats
    });
  } catch (error) {
    console.error('Analytics Technical Error:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

export default router;

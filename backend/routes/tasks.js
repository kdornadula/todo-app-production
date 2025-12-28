import express from 'express';
import { runQuery, runExec } from '../database.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/tasks - Get all tasks with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, category, sort = 'created_at' } = req.query;
    const { priority, search } = req.query;
    
    // Force userId to be an integer (Postgres is strict!)
    const userId = parseInt(req.user.id);
    
    let sql = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    // Filter by status
    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    // Filter by category
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      sql += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }

    // Search filter (Using separate params for better compatibility)
    if (search) {
      const searchPattern = `%${search}%`;
      sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
      params.push(searchPattern, searchPattern);
      paramIndex += 2;
    }

    // Sorting
    const validSortFields = ['created_at', 'due_date', 'title', 'updated_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    sql += ` ORDER BY ${sortField} DESC`;

    try {
      const tasks = await runQuery(sql, params);
      res.json(tasks);
    } catch (dbError) {
      console.error('Database Query Error:', dbError);
      throw dbError; // Caught by the outer catch
    }
  } catch (error) {
    console.error('Fetch Tasks Technical Error:', error.stack);
    res.status(500).json({ error: error.message, detail: 'Check server logs for stack trace' });
  }
});

// GET /api/tasks/export - Export tasks as JSON or CSV
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const userId = parseInt(req.user.id);
    const tasks = await runQuery('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Due Date', 'Created At'];
      const csvRows = [headers.join(',')];

      tasks.forEach(task => {
        const row = [
          task.id,
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || '').replace(/"/g, '""')}"`,
          task.category,
          task.priority || 'medium',
          task.status,
          task.due_date || '',
          task.created_at
        ];
        csvRows.push(row.join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
      res.send(csvRows.join('\n'));
    } else {
      // Return as JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.json');
      res.json(tasks);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);
    const tasks = await runQuery('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(tasks[0]);
  } catch (error) {
    console.error('Fetch Single Task Error:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, category, due_date, priority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const now = new Date().toISOString();
    const isPostgres = !!process.env.DATABASE_URL;
    const sql = isPostgres
      ? `INSERT INTO tasks (title, description, category, due_date, priority, status, user_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8) RETURNING id`
      : `INSERT INTO tasks (title, description, category, due_date, priority, status, user_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)`;

    const result = await runExec(sql, [
      title.trim(),
      description || null,
      category || 'Personal',
      due_date || null,
      priority || 'medium',
      parseInt(req.user.id),
      now,
      now
    ]);

    const selectSql = isPostgres ? 'SELECT * FROM tasks WHERE id = $1' : 'SELECT * FROM tasks WHERE id = ?';
    const newTask = await runQuery(selectSql, [result.id]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, status, due_date, priority } = req.body;
    const now = new Date().toISOString();

    const sql = `
      UPDATE tasks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          status = COALESCE($4, status),
          due_date = COALESCE($5, due_date),
          priority = COALESCE($6, priority),
          updated_at = $7
      WHERE id = $8 AND user_id = $9
    `;

    const taskId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);

    const result = await runExec(sql, [
      title || null,
      description || null,
      category || null,
      status || null,
      due_date || null,
      priority || null,
      now,
      taskId,
      userId
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await runQuery('SELECT * FROM tasks WHERE id = $1', [taskId]);
    res.json(updatedTask[0]);
  } catch (error) {
    console.error('Update Task Error:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tasks/:id/complete - Toggle task completion
router.patch('/:id/complete', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);

    // First get current status
    const tasks = await runQuery('SELECT status FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newStatus = tasks[0].status === 'active' ? 'completed' : 'active';
    const now = new Date().toISOString();

    await runExec(
      'UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
      [newStatus, now, taskId, userId]
    );

    const updatedTask = await runQuery('SELECT * FROM tasks WHERE id = $1', [taskId]);
    res.json(updatedTask[0]);
  } catch (error) {
    console.error('Complete Task Technical Error:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);
    const result = await runExec('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error.stack);
    res.status(500).json({ error: error.message });
  }
});



export default router;

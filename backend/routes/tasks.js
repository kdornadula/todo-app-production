import express from 'express';
import { runQuery, runExec } from '../database.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/tasks - Get all tasks with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, category, sort = 'created_at' } = req.query;
    
    let sql = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [req.user.id];
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
    const { priority, search } = req.query;
    if (priority) {
      sql += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }

    // Search filter
    if (search) {
      sql += ` AND (title LIKE $${paramIndex} OR description LIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${search}%`);
    }

    // Sorting
    const validSortFields = ['created_at', 'due_date', 'title', 'updated_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    sql += ` ORDER BY ${sortField} DESC`;

    const tasks = await runQuery(sql, params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks/export - Export tasks as JSON or CSV
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const tasks = await runQuery('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);

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
    const tasks = await runQuery('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(tasks[0]);
  } catch (error) {
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
      req.user.id,
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

    const result = await runExec(sql, [
      title || null,
      description || null,
      category || null,
      status || null,
      due_date || null,
      priority || null,
      now,
      req.params.id,
      req.user.id
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await runQuery('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    res.json(updatedTask[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tasks/:id/complete - Toggle task completion
router.patch('/:id/complete', async (req, res) => {
  try {
    // First get current status
    const tasks = await runQuery('SELECT status FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newStatus = tasks[0].status === 'active' ? 'completed' : 'active';
    const now = new Date().toISOString();

    await runExec(
      'UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
      [newStatus, now, req.params.id, req.user.id]
    );

    const updatedTask = await runQuery('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    res.json(updatedTask[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const result = await runExec('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;

import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Listar metas
router.get('/', async (req, res) => {
  try {
    const goals = await db.prepare(`
      SELECT * FROM financial_goals 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `).all(req.user.id);

    const formattedGoals = goals.map(g => ({
      ...g,
      isCompleted: Boolean(g.isCompleted),
    }));

    res.json(formattedGoals);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro ao buscar metas' });
  }
});

// Criar meta
router.post('/', async (req, res) => {
  try {
    const { title, description, targetAmount, deadline, category } = req.body;

    if (!title || !targetAmount || !deadline || !category) {
      return res.status(400).json({ error: 'Campos obrigatórios: title, targetAmount, deadline, category' });
    }

    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO financial_goals (id, userId, title, description, targetAmount, currentAmount, deadline, category, isCompleted, createdAt)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, 0, ?)
    `).run(id, req.user.id, title, description || null, targetAmount, deadline, category, createdAt);

    const goal = db.prepare('SELECT * FROM financial_goals WHERE id = ?').get(id);
    res.status(201).json({
      ...goal,
      isCompleted: Boolean(goal.isCompleted),
    });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

// Atualizar meta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetAmount, currentAmount, deadline, category, isCompleted, completedAt } = req.body;

    const existing = await db.prepare('SELECT id FROM financial_goals WHERE id = ? AND userId = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    await db.prepare(`
      UPDATE financial_goals 
      SET title = ?, description = ?, targetAmount = ?, currentAmount = ?, deadline = ?, category = ?, isCompleted = ?, completedAt = ?
      WHERE id = ? AND userId = ?
    `).run(
      title, description || null, targetAmount, currentAmount || 0, deadline, category,
      isCompleted ? 1 : 0, completedAt || null, id, req.user.id
    );

    const goal = await db.prepare('SELECT * FROM financial_goals WHERE id = ?').get(id);
    res.json({
      ...goal,
      isCompleted: Boolean(goal.isCompleted),
    });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({ error: 'Erro ao atualizar meta' });
  }
});

// Deletar meta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.prepare('DELETE FROM financial_goals WHERE id = ? AND userId = ?').run(id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    res.json({ message: 'Meta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({ error: 'Erro ao deletar meta' });
  }
});

export default router;


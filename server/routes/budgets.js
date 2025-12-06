import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Listar orçamentos
router.get('/', (req, res) => {
  try {
    const budgets = db.prepare(`
      SELECT * FROM budgets 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `).all(req.user.id);

    res.json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
});

// Criar orçamento
router.post('/', (req, res) => {
  try {
    const { category, limit, period } = req.body;

    if (!category || !limit || !period) {
      return res.status(400).json({ error: 'Campos obrigatórios: category, limit, period' });
    }

    const id = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO budgets (id, userId, category, limit, spent, period, createdAt)
      VALUES (?, ?, ?, ?, 0, ?, ?)
    `).run(id, req.user.id, category, limit, period, createdAt);

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
});

// Atualizar orçamento
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit, spent, period } = req.body;

    const existing = db.prepare('SELECT id FROM budgets WHERE id = ? AND userId = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    db.prepare(`
      UPDATE budgets 
      SET category = ?, limit = ?, spent = ?, period = ?
      WHERE id = ? AND userId = ?
    `).run(category, limit, spent || 0, period, id, req.user.id);

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.json(budget);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
});

// Deletar orçamento
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM budgets WHERE id = ? AND userId = ?').run(id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: 'Erro ao deletar orçamento' });
  }
});

export default router;


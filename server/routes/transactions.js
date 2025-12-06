import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar transações do usuário
router.get('/', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE userId = ? 
      ORDER BY date DESC, createdAt DESC
    `).all(req.user.id);

    // Converter tags de string para array
    const formattedTransactions = transactions.map(t => ({
      ...t,
      tags: t.tags ? JSON.parse(t.tags) : [],
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Criar transação
router.post('/', (req, res) => {
  try {
    const { type, category, amount, description, date, tags, customCategoryId } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios: type, category, amount, date' });
    }

    const id = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;

    db.prepare(`
      INSERT INTO transactions (id, userId, type, category, amount, description, date, tags, customCategoryId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, type, category, amount, description || null, date, tagsJson, customCategoryId || null, createdAt);

    const transaction = {
      id,
      userId: req.user.id,
      type,
      category,
      amount,
      description: description || '',
      date,
      tags: tags || [],
      customCategoryId: customCategoryId || null,
      createdAt,
    };

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Atualizar transação
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, description, date, tags, customCategoryId } = req.body;

    // Verificar se a transação pertence ao usuário
    const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND userId = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;

    db.prepare(`
      UPDATE transactions 
      SET type = ?, category = ?, amount = ?, description = ?, date = ?, tags = ?, customCategoryId = ?
      WHERE id = ? AND userId = ?
    `).run(type, category, amount, description || null, date, tagsJson, customCategoryId || null, id, req.user.id);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.json({
      ...transaction,
      tags: transaction.tags ? JSON.parse(transaction.tags) : [],
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// Deletar transação
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM transactions WHERE id = ? AND userId = ?').run(id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

export default router;


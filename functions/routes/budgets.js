import express from 'express';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

router.use(authenticateToken);

// Listar orçamentos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('budgets')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .get();

    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
});

// Criar orçamento
router.post('/', async (req, res) => {
  try {
    const { category, limit, period } = req.body;

    if (!category || !limit || !period) {
      return res.status(400).json({ error: 'Campos obrigatórios: category, limit, period' });
    }

    const id = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.collection('budgets').doc(id).set({
      userId: req.user.id,
      category,
      limit,
      spent: 0,
      period,
      createdAt,
    });

    const budget = {
      id,
      userId: req.user.id,
      category,
      limit,
      spent: 0,
      period,
      createdAt,
    };

    res.status(201).json(budget);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
});

// Atualizar orçamento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit, spent, period } = req.body;

    const doc = await db.collection('budgets').doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    await db.collection('budgets').doc(id).update({
      category,
      limit,
      spent: spent || 0,
      period,
    });

    const updatedDoc = await db.collection('budgets').doc(id).get();
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
});

// Deletar orçamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('budgets').doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    await db.collection('budgets').doc(id).delete();

    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: 'Erro ao deletar orçamento' });
  }
});

export default router;


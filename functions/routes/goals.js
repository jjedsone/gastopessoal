import express from 'express';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

router.use(authenticateToken);

// Listar metas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('financial_goals')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .get();

    const goals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        isCompleted: Boolean(data.isCompleted),
      };
    });

    res.json(goals);
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

    await db.collection('financial_goals').doc(id).set({
      userId: req.user.id,
      title,
      description: description || null,
      targetAmount,
      currentAmount: 0,
      deadline,
      category,
      isCompleted: false,
      completedAt: null,
      createdAt,
    });

    const goal = {
      id,
      userId: req.user.id,
      title,
      description: description || null,
      targetAmount,
      currentAmount: 0,
      deadline,
      category,
      isCompleted: false,
      completedAt: null,
      createdAt,
    };

    res.status(201).json(goal);
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

    const doc = await db.collection('financial_goals').doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    await db.collection('financial_goals').doc(id).update({
      title,
      description: description || null,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      category,
      isCompleted: isCompleted ? true : false,
      completedAt: completedAt || null,
    });

    const updatedDoc = await db.collection('financial_goals').doc(id).get();
    const data = updatedDoc.data();
    
    res.json({
      id: updatedDoc.id,
      ...data,
      isCompleted: Boolean(data.isCompleted),
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

    const doc = await db.collection('financial_goals').doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    await db.collection('financial_goals').doc(id).delete();

    res.json({ message: 'Meta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({ error: 'Erro ao deletar meta' });
  }
});

export default router;


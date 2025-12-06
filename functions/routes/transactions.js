import express from 'express';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar transações do usuário
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('transactions')
      .where('userId', '==', req.user.id)
      .orderBy('date', 'desc')
      .orderBy('createdAt', 'desc')
      .get();

    const transactions = snapshot.docs.map(doc => {
      const data = doc.data();
      let tags = [];
      if (data.tags) {
        try {
          tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
          if (!Array.isArray(tags)) tags = [];
        } catch (error) {
          console.error('Erro ao fazer parse de tags:', error);
          tags = [];
        }
      }
      return {
        id: doc.id,
        ...data,
        tags,
      };
    });

    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Criar transação
router.post('/', async (req, res) => {
  try {
    const { type, category, amount, description, date, tags, customCategoryId } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios: type, category, amount, date' });
    }

    const id = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    const tagsData = tags && Array.isArray(tags) ? tags : null;

    await db.collection('transactions').doc(id).set({
      userId: req.user.id,
      type,
      category,
      amount,
      description: description || null,
      date,
      tags: tagsData,
      customCategoryId: customCategoryId || null,
      createdAt,
    });

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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, description, date, tags, customCategoryId } = req.body;

    // Verificar se a transação pertence ao usuário
    const doc = await db.collection('transactions').doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    const tagsData = tags && Array.isArray(tags) ? tags : null;

    await db.collection('transactions').doc(id).update({
      type,
      category,
      amount,
      description: description || null,
      date,
      tags: tagsData,
      customCategoryId: customCategoryId || null,
    });

    const updatedDoc = await db.collection('transactions').doc(id).get();
    const data = updatedDoc.data();
    
    let parsedTags = [];
    if (data.tags) {
      try {
        parsedTags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
        if (!Array.isArray(parsedTags)) parsedTags = [];
      } catch (error) {
        parsedTags = [];
      }
    }
    
    res.json({
      id: updatedDoc.id,
      ...data,
      tags: parsedTags,
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('transactions').doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await db.collection('transactions').doc(id).delete();

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

export default router;


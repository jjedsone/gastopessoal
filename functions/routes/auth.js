import express from 'express';
import bcrypt from 'bcryptjs';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

const router = express.Router();
const db = admin.firestore();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_mude_em_producao';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, type, partnerId } = req.body;

    // Validações
    if (!name || !email || !password || !type) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (!['single', 'couple'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    // Verificar se email já existe
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (!usersSnapshot.empty) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.collection('users').doc(userId).set({
      name,
      email,
      password: hashedPassword,
      type,
      partnerId: partnerId || null,
      createdAt,
    });

    const user = {
      id: userId,
      name,
      email,
      type,
      partnerId: partnerId || null,
    };

    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user,
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      partnerId: user.partnerId,
    };

    const token = generateToken(userData);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Verificar token
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

export default router;


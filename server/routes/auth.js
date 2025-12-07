import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, username, password, type, partnerId } = req.body;

    // Validações
    if (!name || !password || !type) {
      return res.status(400).json({ error: 'Nome, senha e tipo são obrigatórios' });
    }

    if (!['single', 'couple'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    // Gerar username se não fornecido (baseado no nome)
    const finalUsername = username || name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Validar username
    if (finalUsername.length < 3) {
      return res.status(400).json({ error: 'Nome de usuário deve ter pelo menos 3 caracteres' });
    }

    // Verificar se username já existe
    const existingUser = await db.prepare('SELECT id FROM users WHERE username = ?').get(finalUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'Nome de usuário já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.prepare(`
      INSERT INTO users (id, name, username, password, type, partnerId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, finalUsername, hashedPassword, type, partnerId || null, createdAt);

    const user = {
      id: userId,
      name,
      username: finalUsername,
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
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
    }

    // Buscar usuário por username primeiro, depois por email (compatibilidade)
    let user = await db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      // Compatibilidade: tentar buscar por email também
      user = await db.prepare('SELECT * FROM users WHERE email = ?').get(username);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Nome de usuário ou senha incorretos' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Nome de usuário ou senha incorretos' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      username: user.username || user.email || username,
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

// Verificar token (usado pelo frontend para validar sessão)
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_mude_em_producao';
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

export default router;


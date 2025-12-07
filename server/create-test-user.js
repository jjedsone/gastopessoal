/**
 * Script para criar um usuário de teste
 * Execute: node create-test-user.js
 */

import db from './database.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const testUsername = 'teste';
    const testPassword = '123456';
    const testName = 'Usuário Teste';
    
    // Verificar se usuário já existe
    const existingUser = await db.prepare('SELECT id FROM users WHERE username = ?').get(testUsername);
    
    if (existingUser) {
      console.log('✅ Usuário de teste já existe!');
      console.log('Username:', testUsername);
      console.log('Senha:', testPassword);
      return;
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Criar usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO users (id, name, username, password, type, partnerId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, testName, testUsername, hashedPassword, 'single', null, createdAt);
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Credenciais de Teste:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', testUsername);
    console.log('Senha:', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Use essas credenciais para fazer login no sistema.');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    process.exit(1);
  }
}

createTestUser();


/**
 * Script para criar um usuário de teste usando o banco simples (JSON)
 * Execute: node create-test-user-simple.js
 */

import db from './database-simple.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const testUsername = 'teste';
    const testPassword = '123456';
    const testName = 'Usuário Teste';
    
    // Carregar dados existentes
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbPath = path.join(__dirname, 'data.json');
    
    let data = { users: [] };
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, 'utf8');
      data = JSON.parse(fileContent);
    }
    
    // Verificar se usuário já existe
    const existingUser = data.users.find(u => u.username === testUsername);
    
    if (existingUser) {
      console.log('✅ Usuário de teste já existe!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Credenciais de Teste:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Username:', testUsername);
      console.log('Senha:', testPassword);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Criar usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    const newUser = {
      id: userId,
      name: testName,
      username: testUsername,
      password: hashedPassword,
      type: 'single',
      partnerId: null,
      createdAt,
    };
    
    data.users.push(newUser);
    
    // Salvar no arquivo
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    
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


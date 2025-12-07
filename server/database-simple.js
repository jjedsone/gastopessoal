// Versão simplificada do banco de dados usando arquivos JSON
// Use este arquivo temporariamente se better-sqlite3 não estiver instalado
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'data.json');

// Inicializar arquivo de dados se não existir
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    transactions: [],
    budgets: [],
    financial_goals: [],
    custom_categories: [],
    scheduled_expenses: [],
  }, null, 2));
}

// Carregar dados
const loadData = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return {
      users: [],
      transactions: [],
      budgets: [],
      financial_goals: [],
      custom_categories: [],
      scheduled_expenses: [],
    };
  }
};

// Salvar dados
const saveData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

// Simular interface do SQLite
const db = {
  prepare: (query) => {
    const data = loadData();
    
    return {
      get: (...params) => {
        // Implementação simples para SELECT
        if (query.includes('SELECT') && query.includes('WHERE username = ?')) {
          return data.users.find(u => u.username === params[0]);
        }
        // Compatibilidade com email (deprecated)
        if (query.includes('SELECT') && query.includes('WHERE email = ?')) {
          return data.users.find(u => u.username === params[0] || u.email === params[0]);
        }
        if (query.includes('SELECT') && query.includes('WHERE id = ?')) {
          const table = query.match(/FROM (\w+)/)?.[1];
          if (table && data[table]) {
            return data[table].find(item => item.id === params[0]);
          }
        }
        if (query.includes('SELECT') && query.includes('WHERE id = ? AND userId = ?')) {
          const table = query.match(/FROM (\w+)/)?.[1];
          if (table && data[table]) {
            return data[table].find(item => item.id === params[0] && item.userId === params[1]);
          }
        }
        return null;
      },
      all: (...params) => {
        if (query.includes('SELECT') && query.includes('WHERE userId = ?')) {
          const table = query.match(/FROM (\w+)/)?.[1];
          if (table && data[table]) {
            return data[table].filter(item => item.userId === params[0]);
          }
        }
        return [];
      },
      run: (...params) => {
        // Implementação simples para INSERT/UPDATE/DELETE
        if (query.includes('INSERT INTO users')) {
          const [id, name, username, password, type, partnerId, createdAt] = params;
          data.users.push({ id, name, username, password, type, partnerId, createdAt });
          saveData(data);
          return { changes: 1 };
        }
        if (query.includes('INSERT INTO transactions')) {
          const [id, userId, type, category, amount, description, date, tags, customCategoryId, createdAt] = params;
          data.transactions.push({ id, userId, type, category, amount, description, date, tags, customCategoryId, createdAt });
          saveData(data);
          return { changes: 1 };
        }
        if (query.includes('INSERT INTO budgets')) {
          const [id, userId, category, limit, spent, period, createdAt] = params;
          data.budgets.push({ id, userId, category, limit, spent, period, createdAt });
          saveData(data);
          return { changes: 1 };
        }
        if (query.includes('INSERT INTO financial_goals')) {
          const [id, userId, title, description, targetAmount, currentAmount, deadline, category, isCompleted, createdAt] = params;
          data.financial_goals.push({ id, userId, title, description, targetAmount, currentAmount, deadline, category, isCompleted, createdAt });
          saveData(data);
          return { changes: 1 };
        }
        if (query.includes('UPDATE') && query.includes('WHERE id = ?')) {
          const table = query.match(/UPDATE (\w+)/)?.[1];
          
          // Extrair nomes de campos da query UPDATE
          const setClause = query.match(/SET (.+?) WHERE/)?.[1];
          if (setClause && table && data[table]) {
            // Parse dos campos SET (ex: "category = ?, limit = ?, spent = ?")
            const fieldMatches = setClause.matchAll(/(\w+)\s*=\s*\?/g);
            const fields = Array.from(fieldMatches, m => m[1]);
            
            // Determinar quantos parâmetros são valores e quantos são condições WHERE
            const whereClause = query.match(/WHERE (.+)/)?.[1];
            const whereParams = whereClause ? whereClause.split('AND').length : 0;
            
            // Os últimos parâmetros são para WHERE (id, userId, etc)
            const valueParams = params.slice(0, params.length - whereParams);
            const whereValueParams = params.slice(params.length - whereParams);
            
            // Encontrar o registro pelo WHERE
            let index = -1;
            if (whereClause.includes('id = ?') && whereClause.includes('userId = ?')) {
              const id = whereValueParams[whereValueParams.length - 2];
              const userId = whereValueParams[whereValueParams.length - 1];
              index = data[table].findIndex(item => item.id === id && item.userId === userId);
            } else if (whereClause.includes('id = ?')) {
              const id = whereValueParams[0];
              index = data[table].findIndex(item => item.id === id);
            }
            
            if (index !== -1) {
              // Criar objeto com mapeamento correto campo-valor
              const updates = {};
              fields.forEach((field, idx) => {
                if (valueParams[idx] !== undefined) {
                  updates[field] = valueParams[idx];
                }
              });
              
              Object.assign(data[table][index], updates);
              saveData(data);
              return { changes: 1 };
            }
          }
        }
        if (query.includes('DELETE') && query.includes('WHERE id = ?')) {
          const table = query.match(/FROM (\w+)/)?.[1];
          
          // Determinar parâmetros WHERE
          const whereClause = query.match(/WHERE (.+)/)?.[1];
          let index = -1;
          
          if (whereClause && whereClause.includes('userId = ?')) {
            // DELETE com id e userId
            const id = params[params.length - 2];
            const userId = params[params.length - 1];
            index = data[table].findIndex(item => item.id === id && item.userId === userId);
          } else {
            // DELETE apenas com id
            const id = params[params.length - 1];
            index = data[table].findIndex(item => item.id === id);
          }
          
          if (index !== -1) {
            data[table].splice(index, 1);
            saveData(data);
            return { changes: 1 };
          }
        }
        return { changes: 0 };
      },
    };
  },
  exec: (sql) => {
    // Para CREATE TABLE, não fazemos nada na versão JSON
    return true;
  },
  pragma: (command) => {
    // Suportar pragma para compatibilidade, mas não fazer nada no JSON
    return true;
  },
  close: () => {
    // Método close para compatibilidade
  },
};

export default db;

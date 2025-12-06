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
  }));
}

// Carregar dados
const loadData = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
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
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Simular interface do SQLite
const db = {
  prepare: (query) => {
    const data = loadData();
    
    return {
      get: (...params) => {
        // Implementação simples para SELECT
        if (query.includes('SELECT') && query.includes('WHERE email = ?')) {
          return data.users.find(u => u.email === params[0]);
        }
        if (query.includes('SELECT') && query.includes('WHERE id = ?')) {
          const table = query.match(/FROM (\w+)/)?.[1];
          if (table && data[table]) {
            return data[table].find(item => item.id === params[0]);
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
          const [id, name, email, password, type, partnerId, createdAt] = params;
          data.users.push({ id, name, email, password, type, partnerId, createdAt });
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
          const id = params[params.length - 1];
          if (table && data[table]) {
            const index = data[table].findIndex(item => item.id === id);
            if (index !== -1) {
              // Atualizar campos baseado na query
              Object.assign(data[table][index], params.slice(0, -1));
              saveData(data);
              return { changes: 1 };
            }
          }
        }
        if (query.includes('DELETE') && query.includes('WHERE id = ?')) {
          const table = query.match(/FROM (\w+)/)?.[1];
          const id = params[params.length - 1];
          if (table && data[table]) {
            const index = data[table].findIndex(item => item.id === id);
            if (index !== -1) {
              data[table].splice(index, 1);
              saveData(data);
              return { changes: 1 };
            }
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
};

export default db;


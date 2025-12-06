// Tentar usar better-sqlite3, se não disponível, usar versão JSON
let db;
try {
  const Database = (await import('better-sqlite3')).default;
  const path = (await import('path')).default;
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  db = new Database(path.join(__dirname, 'finance.db'));
} catch (error) {
  console.warn('⚠️  better-sqlite3 não disponível, usando armazenamento JSON');
  db = (await import('./database-simple.js')).default;
}

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('single', 'couple')),
    partnerId TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (partnerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    tags TEXT,
    customCategoryId TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    category TEXT NOT NULL,
    limit REAL NOT NULL,
    spent REAL NOT NULL DEFAULT 0,
    period TEXT NOT NULL CHECK(period IN ('monthly', 'weekly')),
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS financial_goals (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    targetAmount REAL NOT NULL,
    currentAmount REAL NOT NULL DEFAULT 0,
    deadline TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('savings', 'debt', 'investment', 'purchase', 'other')),
    isCompleted INTEGER NOT NULL DEFAULT 0,
    completedAt TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS custom_categories (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    parentCategoryId TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS scheduled_expenses (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    scheduledDate TEXT NOT NULL,
    frequency TEXT CHECK(frequency IN ('once', 'weekly', 'monthly', 'yearly')),
    isCompleted INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(userId);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(userId);
  CREATE INDEX IF NOT EXISTS idx_goals_user ON financial_goals(userId);
`);

export default db;


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import transactionsRoutes from './routes/transactions.js';
import budgetsRoutes from './routes/budgets.js';
import goalsRoutes from './routes/goals.js';
import db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://gastopessoal-ac9aa.web.app',
    'https://gastopessoal-ac9aa.firebaseapp.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/goals', goalsRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Servidor Backend Iniciado');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`📊 Banco de dados: Inicializado`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 Endpoints disponíveis:');
  console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET    http://localhost:${PORT}/api/auth/verify`);
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log('\n✅ Servidor pronto para receber requisições!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n👋 Servidor encerrado');
  process.exit(0);
});


import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

// Importar rotas
import authRoutes from './routes/auth.js';
import transactionsRoutes from './routes/transactions.js';
import budgetsRoutes from './routes/budgets.js';
import goalsRoutes from './routes/goals.js';

const app = express();

// CORS configurado para aceitar requisições do Firebase Hosting
const corsOptions = {
  origin: true, // Aceita todas as origens (Firebase Functions gerencia CORS)
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

// Rotas - Firebase Functions já adiciona /api no rewrite
// Então as rotas devem ser sem /api
app.use('/auth', authRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/budgets', budgetsRoutes);
app.use('/goals', goalsRoutes);

// Exportar como Cloud Function
export const api = onRequest(
  {
    cors: true, // Firebase Functions gerencia CORS automaticamente
    region: 'us-central1',
  },
  app
);


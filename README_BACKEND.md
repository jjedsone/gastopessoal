# 🚀 Backend - Gasto Pessoal

Backend completo com autenticação JWT e banco de dados SQLite para o sistema de gestão financeira.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Windows (para SQLite)
- Visual Studio Build Tools com C++ build tools
- Windows SDK 10.0.19041.0 ou superior

## 🔧 Instalação

1. **Instalar dependências do backend:**
```bash
cd server
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao
NODE_ENV=development
```

3. **Configurar frontend:**
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:3001/api
```

## ▶️ Executar

### Backend
```bash
cd server
npm start
```

### Frontend (em outro terminal)
```bash
npm run dev
```

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login  
- `GET /api/auth/verify` - Verificar token

### Transações
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação

### Orçamentos
- `GET /api/budgets` - Listar orçamentos
- `POST /api/budgets` - Criar orçamento
- `PUT /api/budgets/:id` - Atualizar orçamento
- `DELETE /api/budgets/:id` - Deletar orçamento

### Metas
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Criar meta
- `PUT /api/goals/:id` - Atualizar meta
- `DELETE /api/goals/:id` - Deletar meta

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT
- ✅ Tokens expiram em 7 dias
- ✅ Todas as rotas protegidas (exceto auth)
- ✅ Validação de dados

## 🗄️ Banco de Dados

O sistema usa SQLite com `better-sqlite3`. O banco de dados (`finance.db`) é criado automaticamente na primeira execução.

**Estrutura:**
- `users` - Usuários e autenticação
- `transactions` - Transações financeiras
- `budgets` - Orçamentos
- `financial_goals` - Metas financeiras
- `custom_categories` - Categorias personalizadas
- `scheduled_expenses` - Despesas agendadas

## 🐛 Solução de Problemas

### Erro ao instalar better-sqlite3 no Windows

1. Instale Visual Studio Build Tools
2. Instale Windows SDK
3. Execute: `npm install --build-from-source`

Ou use uma alternativa temporária editando `server/database.js` para usar JSON.

### Porta já em uso

Altere a porta no arquivo `.env` do servidor.

## 📝 Notas

- O backend roda na porta 3001 por padrão
- O frontend deve estar configurado para apontar para `http://localhost:3001/api`
- Em produção, configure um JWT_SECRET seguro e use HTTPS


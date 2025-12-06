# Backend - Gasto Pessoal

Backend API para o sistema de gestão financeira pessoal.

## Instalação

```bash
cd server
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e configure:
- `PORT`: Porta do servidor (padrão: 3001)
- `JWT_SECRET`: Chave secreta para JWT (mude em produção!)
- `NODE_ENV`: Ambiente (development/production)

## Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## API Endpoints

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

## Banco de Dados

O sistema usa SQLite com `better-sqlite3`. O banco de dados é criado automaticamente na primeira execução.

## Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT
- Tokens expiram em 7 dias
- Todas as rotas (exceto auth) requerem autenticação


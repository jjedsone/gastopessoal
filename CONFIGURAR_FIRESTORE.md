# Configuração do Firestore Database

## 📋 Visão Geral

Este projeto usa **Firestore Database** (não Realtime Database). O Firestore é um banco de dados NoSQL baseado em documentos.

## 🔧 Passos para Configuração

### 1. Criar o Firestore Database

1. Acesse o [Firebase Console](https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore)
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. Escolha o modo:
   - **Modo de produção**: Regras de segurança mais restritivas (recomendado)
   - **Modo de teste**: Permite leitura/escrita por 30 dias (para desenvolvimento)
4. Escolha a localização: **nam5 (us-central)** (já configurado no `firebase.json`)

### 2. Deploy das Regras de Segurança

As regras já estão configuradas em `firestore.rules`. Para fazer deploy:

```bash
firebase deploy --only firestore:rules --project gastopessoal-ac9aa
```

**Regras configuradas:**
- ✅ Usuários: apenas o próprio usuário pode ler/escrever seus dados
- ✅ Transações: apenas o usuário dono pode acessar
- ✅ Orçamentos: apenas o usuário dono pode acessar
- ✅ Metas financeiras: apenas o usuário dono pode acessar
- ✅ Categorias personalizadas: apenas o usuário dono pode acessar
- ✅ Despesas agendadas: apenas o usuário dono pode acessar

### 3. Deploy dos Índices

Os índices já estão configurados em `firestore.indexes.json`. Para fazer deploy:

```bash
firebase deploy --only firestore:indexes --project gastopessoal-ac9aa
```

**Índices configurados:**
- ✅ Transações: indexação por `userId`, `date`, `createdAt` para consultas rápidas

### 4. Deploy Completo (Recomendado)

Para fazer deploy de tudo de uma vez:

```bash
firebase deploy --only firestore --project gastopessoal-ac9aa
```

## 📊 Estrutura das Coleções

O Firestore organiza os dados em **coleções** e **documentos**:

```
firestore/
├── users/
│   └── {userId}/
│       ├── name: string
│       ├── email: string
│       ├── password: string (hash)
│       ├── type: 'single' | 'couple'
│       ├── partnerId: string | null
│       └── createdAt: timestamp
│
├── transactions/
│   └── {transactionId}/
│       ├── userId: string
│       ├── type: 'income' | 'expense'
│       ├── category: string
│       ├── amount: number
│       ├── description: string
│       ├── date: string
│       ├── tags: array
│       └── createdAt: timestamp
│
├── budgets/
│   └── {budgetId}/
│       ├── userId: string
│       ├── category: string
│       ├── amount: number
│       ├── period: 'monthly' | 'yearly'
│       └── createdAt: timestamp
│
├── financial_goals/
│   └── {goalId}/
│       ├── userId: string
│       ├── title: string
│       ├── description: string
│       ├── targetAmount: number
│       ├── currentAmount: number
│       ├── deadline: string
│       ├── category: string
│       └── isCompleted: boolean
│
├── custom_categories/
│   └── {categoryId}/
│       ├── userId: string
│       ├── name: string
│       ├── type: 'income' | 'expense'
│       └── createdAt: timestamp
│
└── scheduled_expenses/
    └── {expenseId}/
        ├── userId: string
        ├── description: string
        ├── amount: number
        ├── category: string
        ├── frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
        ├── nextDate: string
        └── createdAt: timestamp
```

## 🔐 Regras de Segurança

As regras garantem que:
- ✅ Cada usuário só acessa seus próprios dados
- ✅ Autenticação é obrigatória para todas as operações
- ✅ Validação de `userId` em todas as operações

## 🧪 Testar a Configuração

### 1. Verificar se o Firestore está ativo

Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore

Você deve ver a interface do Firestore.

### 2. Testar via Firebase Functions

Após fazer deploy das Functions:

```bash
# Health check
curl https://gastopessoal-ac9aa.web.app/api/health

# Registrar usuário (teste)
curl -X POST https://gastopessoal-ac9aa.web.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@teste.com",
    "password": "123456",
    "type": "single"
  }'
```

## ⚠️ Importante

### Diferença entre Firestore e Realtime Database

- **Firestore** (este projeto): Banco de dados NoSQL baseado em documentos
- **Realtime Database**: Banco de dados em tempo real baseado em JSON

O link que você compartilhou é para Realtime Database, mas este projeto usa **Firestore**.

### Localização do Firestore

A localização está configurada como **nam5 (us-central)** no `firebase.json`. Isso não pode ser alterado após a criação do banco.

## 🚀 Próximos Passos

1. ✅ Criar o Firestore Database no console
2. ✅ Fazer deploy das regras: `firebase deploy --only firestore:rules`
3. ✅ Fazer deploy dos índices: `firebase deploy --only firestore:indexes`
4. ✅ Fazer deploy das Functions: `firebase deploy --only functions`
5. ✅ Testar o registro de usuário

## 📚 Recursos

- [Documentação do Firestore](https://firebase.google.com/docs/firestore)
- [Regras de Segurança](https://firebase.google.com/docs/firestore/security/get-started)
- [Console do Firestore](https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore)

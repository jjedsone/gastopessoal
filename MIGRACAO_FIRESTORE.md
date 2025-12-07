# Migração para Firestore - Concluída ✅

O projeto foi migrado para usar o Firestore diretamente no front-end, substituindo a API REST.

## O que foi feito

### 1. ✅ Instalação do Firebase SDK
- Instalado `firebase` no front-end
- Configuração do Firebase em `src/config/firebase.ts`

### 2. ✅ Serviços Firestore Criados
- `src/services/firestoreService.ts` - Serviços para todas as operações CRUD:
  - `transactionsService` - Transações
  - `budgetsService` - Orçamentos
  - `goalsService` - Metas financeiras
  - `categoriesService` - Categorias personalizadas
  - `scheduledExpensesService` - Despesas agendadas
  - `usersService` - Usuários

### 3. ✅ Autenticação com Firebase Auth
- `src/services/authService.ts` - Serviço de autenticação:
  - Registro de usuários com username/password
  - Login com username/password
  - Logout
  - Verificação de autenticação
  - Conversão automática de username para email (Firebase Auth requer email)

### 4. ✅ Migração do FinanceContext
- Atualizado para usar Firestore diretamente
- Usa `onAuthStateChanged` para detectar mudanças de autenticação
- Carrega dados automaticamente quando usuário faz login

### 5. ✅ Migração do Login
- Atualizado para usar `authService` em vez de `authAPI`
- Mantém a mesma interface (username/password)

### 6. ✅ Regras do Firestore
- Regras atualizadas conforme especificado
- Deploy realizado com sucesso

## Próximos Passos

### 1. Configurar Credenciais do Firebase

**Opção A: Usar Variáveis de Ambiente (Recomendado)**

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Obtenha as credenciais no Firebase Console:
   - Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/settings/general
   - Role até "Seus apps" e copie as credenciais
   - Veja `COMO_OBTER_FIRESTORE_CONFIG.md` para instruções detalhadas

3. Preencha o arquivo `.env` com as credenciais reais

**Opção B: Editar Diretamente o Arquivo**

1. Edite `src/config/firebase.ts`
2. Substitua os valores placeholder pelas credenciais reais do Firebase Console

### 2. Ativar Firestore no Firebase Console

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção (ou teste para desenvolvimento)
4. Escolha a localização (já configurada como `nam5`)

### 3. Ativar Firebase Authentication

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/authentication
2. Clique em "Começar"
3. Ative o provedor "Email/Password"

### 4. Testar a Aplicação

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:5173

3. Crie uma conta ou faça login

4. Verifique se os dados estão sendo salvos no Firestore:
   - Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore/data

## Estrutura de Dados no Firestore

### Coleções

- `users` - Dados dos usuários
- `transactions` - Transações financeiras
- `budgets` - Orçamentos
- `financial_goals` - Metas financeiras
- `custom_categories` - Categorias personalizadas
- `scheduled_expenses` - Despesas agendadas

## Funções Firestore Utilizadas

- `addDoc()` - Criar documentos
- `setDoc()` - Criar/atualizar documentos específicos
- `getDoc()` - Obter um documento
- `getDocs()` - Obter múltiplos documentos
- `updateDoc()` - Atualizar documentos
- `deleteDoc()` - Deletar documentos
- `query()` - Criar consultas
- `where()` - Filtrar documentos
- `orderBy()` - Ordenar resultados

## Segurança

As regras do Firestore estão configuradas para:
- Permitir acesso autenticado aos dados do próprio usuário
- Validar `userId` em todas as operações
- Proteger contra acesso não autorizado

⚠️ **Importante**: As regras atuais permitem acesso amplo para facilitar o desenvolvimento. Ajuste as regras para produção conforme necessário.

## Troubleshooting

### Erro: "Firebase não configurado"
- Configure as credenciais em `.env` ou `src/config/firebase.ts`
- Veja `COMO_OBTER_FIREBASE_CONFIG.md`

### Erro: "Permission denied"
- Verifique se o Firestore está ativado
- Verifique se as regras foram deployadas: `firebase deploy --only firestore:rules`
- Verifique se o usuário está autenticado

### Erro: "User not found"
- Verifique se o Firebase Authentication está ativado
- Verifique se o provedor Email/Password está habilitado

## Arquivos Modificados

- `src/config/firebase.ts` - Configuração do Firebase
- `src/services/firestoreService.ts` - Serviços Firestore (NOVO)
- `src/services/authService.ts` - Serviço de autenticação (NOVO)
- `src/context/FinanceContext.tsx` - Migrado para Firestore
- `src/components/Login.tsx` - Migrado para Firebase Auth
- `firestore.rules` - Regras atualizadas
- `package.json` - Adicionado `firebase`
- `.env.example` - Exemplo de variáveis de ambiente (NOVO)
- `COMO_OBTER_FIREBASE_CONFIG.md` - Guia de configuração (NOVO)

## Status

✅ Migração concluída com sucesso!
✅ Regras do Firestore deployadas
⏳ Aguardando configuração das credenciais do Firebase


# 🔥 Configuração do Firestore no Backend

## Passo 1: Obter Credenciais do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/project/gastopessoal-ac9aa/settings/serviceaccounts/adminsdk)
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON
4. Renomeie para `firebase-service-account.json`
5. Coloque o arquivo na pasta `server/`

## Passo 2: Configurar Variáveis de Ambiente

Crie o arquivo `server/.env`:

```env
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao
NODE_ENV=production
FIREBASE_PROJECT_ID=gastopessoal-ac9aa
```

## Passo 3: Instalar Dependências

```bash
cd server
npm install
```

## Passo 4: Testar o Servidor

```bash
npm start
```

O servidor tentará usar Firestore automaticamente. Se as credenciais estiverem configuradas, você verá:

```
✅ Firestore inicializado com sucesso
✅ Usando Firestore Database
```

## Estrutura do Firestore

O sistema criará automaticamente as seguintes coleções:

- `users` - Usuários e autenticação
- `transactions` - Transações financeiras
- `budgets` - Orçamentos
- `financial_goals` - Metas financeiras
- `custom_categories` - Categorias personalizadas
- `scheduled_expenses` - Despesas agendadas

## Fallback Automático

O sistema tem fallback automático:
1. **Firestore** (prioridade) - Se credenciais estiverem disponíveis
2. **SQLite** - Se Firestore não disponível mas better-sqlite3 instalado
3. **JSON** - Modo desenvolvimento (fallback final)

## Segurança

- O arquivo `firebase-service-account.json` está no `.gitignore`
- Nunca commite credenciais no Git
- Use variáveis de ambiente em produção
- As regras de segurança do Firestore já estão configuradas

## Deploy em Produção

Para usar Firestore em produção (ex: Firebase Functions, Cloud Run):

1. Configure as credenciais como variáveis de ambiente
2. Ou use Application Default Credentials do GCP
3. O código detectará automaticamente e usará Firestore


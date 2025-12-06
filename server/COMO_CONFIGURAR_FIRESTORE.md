# 🔥 Como Configurar Firestore no Backend

## Passo 1: Obter Credenciais do Firebase

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/settings/serviceaccounts/adminsdk
2. Clique em **"Gerar nova chave privada"**
3. Baixe o arquivo JSON
4. Renomeie para `firebase-service-account.json`
5. Coloque na pasta `server/`

⚠️ **IMPORTANTE**: Este arquivo contém credenciais sensíveis. Nunca commite no Git!

## Passo 2: Instalar Dependências

```bash
cd server
npm install
```

## Passo 3: Configurar Variáveis de Ambiente (Opcional)

Crie `server/.env`:

```env
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro
NODE_ENV=production
FIREBASE_PROJECT_ID=gastopessoal-ac9aa
```

## Passo 4: Testar o Servidor

```bash
npm start
```

Você deve ver:
```
✅ Firestore inicializado com sucesso
✅ Usando Firestore Database
🚀 Servidor rodando na porta 3001
```

## Como Funciona

O sistema tem **fallback automático**:

1. **Firestore** (prioridade) - Se `firebase-service-account.json` existir
2. **SQLite** - Se Firestore não disponível mas `better-sqlite3` instalado
3. **JSON** - Modo desenvolvimento (fallback final)

## Estrutura do Firestore

As seguintes coleções serão criadas automaticamente:

- `users` - Usuários e autenticação
- `transactions` - Transações financeiras  
- `budgets` - Orçamentos
- `financial_goals` - Metas financeiras
- `custom_categories` - Categorias personalizadas
- `scheduled_expenses` - Despesas agendadas

## Segurança

✅ Regras de segurança já configuradas no Firestore
✅ Usuários só acessam seus próprios dados
✅ Arquivo de credenciais no `.gitignore`
✅ Validação de userId em todas as operações

## Deploy em Produção

Para usar em produção (Firebase Functions, Cloud Run, etc):

1. Configure as credenciais como variáveis de ambiente
2. Ou use Application Default Credentials do GCP
3. O código detectará automaticamente e usará Firestore

## Troubleshooting

### Erro: "Firestore não disponível"
- Verifique se o arquivo `firebase-service-account.json` existe
- Verifique se as credenciais estão corretas
- Verifique se o projeto Firebase está ativo

### Erro: "Permission denied"
- Verifique as regras do Firestore no console
- Certifique-se de que o service account tem permissões adequadas

### Usando fallback JSON
- Isso é normal se as credenciais não estiverem configuradas
- Para desenvolvimento local, funciona perfeitamente
- Para produção, configure o Firestore seguindo os passos acima


# Como Deployar Firebase Functions

## ⚠️ Requisito Importante

Para fazer deploy das Firebase Functions, você precisa estar no **plano Blaze (pay-as-you-go)** do Firebase.

## Passos para Deploy

### 1. Verificar se está no plano Blaze

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/settings/plan
2. Se não estiver no plano Blaze, faça o upgrade

### 2. Instalar dependências das Functions

```bash
cd functions
npm install
```

### 3. Configurar variáveis de ambiente (opcional)

Crie um arquivo `.env` em `functions/` ou configure no Firebase Console:

```bash
JWT_SECRET=sua_chave_secreta_super_segura_aqui
```

### 4. Fazer deploy das Functions

```bash
# Voltar para a raiz do projeto
cd ..

# Deploy apenas das Functions
firebase deploy --only functions --project gastopessoal-ac9aa
```

### 5. Verificar se funcionou

Após o deploy, teste acessando:
- https://gastopessoal-ac9aa.web.app/api/health

Deve retornar: `{"status":"ok","message":"Servidor funcionando"}`

## Alternativa: Usar Servidor Local

Se não quiser usar o plano Blaze, você pode:

1. Rodar o servidor local em `http://localhost:3001`
2. Acessar o frontend em `http://localhost:5173` (modo desenvolvimento)
3. Ou configurar um proxy/tunnel (ngrok, etc.)

## Estrutura das Rotas

Após o deploy, as rotas estarão disponíveis em:
- `/api/auth/register` - Registrar usuário
- `/api/auth/login` - Login
- `/api/auth/verify` - Verificar token
- `/api/transactions` - CRUD de transações
- `/api/budgets` - CRUD de orçamentos
- `/api/goals` - CRUD de metas

## Troubleshooting

### Erro: "Your project must be on the Blaze plan"
- Solução: Faça upgrade para o plano Blaze

### Erro: "Function failed to deploy"
- Verifique os logs: `firebase functions:log`
- Verifique se todas as dependências estão instaladas
- Verifique se o Firestore está configurado corretamente

### Erro 404 ao acessar `/api/**`
- Verifique se as Functions foram deployadas: `firebase functions:list`
- Verifique o `firebase.json` se o rewrite está correto


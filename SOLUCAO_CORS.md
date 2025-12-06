# 🔧 Solução para Erro de CORS

## Problema
O frontend no Firebase Hosting (`https://gastopessoal-ac9aa.web.app`) não consegue acessar o backend em `localhost:3001` devido a políticas de CORS.

## ✅ Solução 1: Configurar CORS no Servidor Local (Imediato)

O servidor já está configurado para aceitar requisições do Firebase Hosting. Basta iniciar o servidor:

```bash
cd server
npm start
```

O servidor aceitará requisições de:
- ✅ `https://gastopessoal-ac9aa.web.app`
- ✅ `https://gastopessoal-ac9aa.firebaseapp.com`
- ✅ `http://localhost:5173` (desenvolvimento)
- ✅ `http://localhost:3000` (desenvolvimento)

## ✅ Solução 2: Usar Firebase Functions (Recomendado para Produção)

### Requisitos
- Plano Firebase Blaze (pay-as-you-go)
- Ativar billing no Firebase

### Passos

1. **Ativar Billing:**
   - Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/usage/details
   - Faça upgrade para o plano Blaze

2. **Deploy das Functions:**
   ```bash
   firebase deploy --only functions
   ```

3. **Atualizar Frontend:**
   O frontend já está configurado para usar `/api` em produção, que será redirecionado para Firebase Functions via rewrite.

## ✅ Solução 3: Usar Servidor em Produção (Alternativa)

Você pode hospedar o servidor Express em:
- **Railway** (https://railway.app)
- **Render** (https://render.com)
- **Heroku** (https://heroku.com)
- **DigitalOcean App Platform**
- **Google Cloud Run**

Depois, atualize a variável de ambiente `VITE_API_URL` no Firebase Hosting.

## 🚀 Como Testar Agora

1. **Inicie o servidor local:**
   ```bash
   cd server
   npm start
   ```

2. **Acesse o frontend:**
   - Local: http://localhost:5173 (npm run dev)
   - Produção: https://gastopessoal-ac9aa.web.app

3. **Teste o registro/login:**
   - O frontend detectará automaticamente se está em produção ou desenvolvimento
   - Em produção, tentará usar `/api` (Firebase Functions)
   - Em desenvolvimento, usará `http://localhost:3001/api`

## 📝 Notas Importantes

- O servidor local já está configurado com CORS correto
- O frontend detecta automaticamente o ambiente
- Para produção real, recomenda-se usar Firebase Functions ou hospedar o servidor separadamente


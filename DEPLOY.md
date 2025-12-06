# 🚀 Guia de Deploy - Gasto Pessoal

## ✅ Deploy Concluído!

### Firebase Hosting
- **URL:** https://gastopessoal-ac9aa.web.app
- **Status:** ✅ Deploy completo
- **Console:** https://console.firebase.google.com/project/gastopessoal-ac9aa/overview

### Firestore Database
- **Status:** ✅ Configurado
- **Regras de Segurança:** ✅ Deploy completo
- **Índices:** Configurados para otimização de queries

## 📋 Próximos Passos

### 1. Configurar Variáveis de Ambiente

No Firebase Hosting, configure as variáveis de ambiente para apontar para seu backend:

```bash
# Se usar Firebase Functions para o backend
firebase functions:config:set api.url="https://seu-backend.com/api"

# Ou configure diretamente no código
```

### 2. Atualizar API URL no Frontend

Edite `src/utils/api.ts` para usar a URL do backend em produção:

```typescript
const API_URL = (import.meta.env?.VITE_API_URL as string) || 
  'https://seu-backend.com/api';
```

### 3. Configurar Firestore no Backend (Opcional)

Se quiser migrar do SQLite para Firestore:

1. Instale Firebase Admin SDK no backend:
```bash
cd server
npm install firebase-admin
```

2. Configure as credenciais do Firebase
3. Atualize `server/database.js` para usar Firestore

### 4. Deploy Automático

Configure GitHub Actions para deploy automático:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: gastopessoal-ac9aa
```

## 🔧 Comandos Úteis

### Deploy do Frontend
```bash
npm run build
firebase deploy --only hosting
```

### Deploy das Regras do Firestore
```bash
firebase deploy --only firestore:rules
```

### Deploy Completo
```bash
firebase deploy
```

### Ver Logs
```bash
firebase hosting:channel:list
```

## 📝 Notas

- O frontend está disponível em: https://gastopessoal-ac9aa.web.app
- As regras do Firestore garantem que usuários só acessem seus próprios dados
- O backend ainda usa SQLite/JSON localmente, mas pode ser migrado para Firestore
- Configure CORS no backend para permitir requisições do Firebase Hosting


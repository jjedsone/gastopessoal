# Como Obter as Credenciais do Firebase

Para usar o Firestore diretamente no front-end, você precisa obter as credenciais de configuração do Firebase Console.

## Passo a Passo

1. **Acesse o Firebase Console**
   - Vá para: https://console.firebase.google.com/project/gastopessoal-ac9aa/settings/general

2. **Navegue até as Configurações do Projeto**
   - No menu lateral, clique em ⚙️ **Configurações do Projeto** (Project Settings)
   - Ou acesse diretamente: https://console.firebase.google.com/project/gastopessoal-ac9aa/settings/general

3. **Role até a seção "Seus apps"**
   - Procure por "Seus apps" (Your apps) ou "SDK setup and configuration"
   - Se não houver um app web criado, clique em **"Adicionar app"** (Add app) e escolha **"Web"** (</>)

4. **Copie as Credenciais**
   - Você verá um objeto JavaScript com as credenciais:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "gastopessoal-ac9aa.firebaseapp.com",
     projectId: "gastopessoal-ac9aa",
     storageBucket: "gastopessoal-ac9aa.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdefghijklmnop"
   };
   ```

5. **Status da Configuração**
   - ✅ **As credenciais já estão configuradas** em `src/config/firebase.ts`
   - O arquivo já contém as credenciais reais como valores padrão
   - O código também suporta variáveis de ambiente (opcional)

## Configuração Atual

O arquivo `src/config/firebase.ts` já está configurado com as credenciais reais e suporta variáveis de ambiente:

```typescript
// @ts-ignore - Vite environment variables
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY || "AIzaSyBYOxWOrLXqrPSlICyVKWZ6bDlytWLbzK4",
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || "gastopessoal-ac9aa.firebaseapp.com",
  databaseURL: env?.VITE_FIREBASE_DATABASE_URL || "https://gastopessoal-ac9aa-default-rtdb.firebaseio.com",
  projectId: env?.VITE_FIREBASE_PROJECT_ID || "gastopessoal-ac9aa",
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || "gastopessoal-ac9aa.firebasestorage.app",
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "725746079454",
  appId: env?.VITE_FIREBASE_APP_ID || "1:725746079454:web:cc2a8db58bce248231544f",
  measurementId: env?.VITE_FIREBASE_MEASUREMENT_ID || "G-96JMW7CYPX"
};
```

**Como funciona:**
- Se você criar um arquivo `.env` com as variáveis, elas serão usadas
- Caso contrário, os valores padrão (já configurados) serão usados

## Opcional: Usar Variáveis de Ambiente

Para maior segurança em produção, você pode usar variáveis de ambiente:

1. Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyBYOxWOrLXqrPSlICyVKWZ6bDlytWLbzK4
   VITE_FIREBASE_AUTH_DOMAIN=gastopessoal-ac9aa.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://gastopessoal-ac9aa-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=gastopessoal-ac9aa
   VITE_FIREBASE_STORAGE_BUCKET=gastopessoal-ac9aa.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=725746079454
   VITE_FIREBASE_APP_ID=1:725746079454:web:cc2a8db58bce248231544f
   VITE_FIREBASE_MEASUREMENT_ID=G-96JMW7CYPX
   ```

2. O código já está preparado para usar essas variáveis automaticamente!

## Importante

⚠️ **Nunca commite credenciais reais no Git!**
- Adicione `.env` ao `.gitignore`
- Use variáveis de ambiente em produção (Firebase Hosting permite configurar variáveis de ambiente)

## Status Atual

✅ **Credenciais configuradas** - O Firebase já está configurado e pronto para uso  
✅ **Regras do Firestore deployadas** - As regras de segurança já foram publicadas  
⏳ **Aguardando ativação** - Você precisa ativar o Firestore e Authentication no console

## Próximos Passos

1. **Ative o Firestore no Firebase Console**
   - Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore
   - Clique em "Criar banco de dados"
   - Escolha o modo (produção ou teste)
   - Escolha a localização (já configurada como `nam5`)

2. **Ative o Firebase Authentication**
   - Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/authentication
   - Clique em "Começar"
   - Ative o provedor "Email/Password"

3. **Teste a aplicação**
   ```bash
   npm run dev
   ```
   - Acesse: http://localhost:5173
   - Crie uma conta ou faça login
   - Verifique se os dados estão sendo salvos no Firestore


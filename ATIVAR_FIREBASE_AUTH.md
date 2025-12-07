# 🔥 Como Ativar o Firebase Authentication

## 🔴 Erro Atual

Se você está vendo este erro:
```
FirebaseError: Firebase: Error (auth/configuration-not-found)
```

Isso significa que o **Firebase Authentication não está ativado** no seu projeto.

## ✅ Solução Passo a Passo (COM IMAGENS)

### Passo 1: Acesse o Firebase Console

**Link direto:** https://console.firebase.google.com/project/gastopessoal-ac9aa/authentication

Ou navegue manualmente:
1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto: **gastopessoal-ac9aa**
3. No menu lateral esquerdo, clique em **"Authentication"** (Autenticação)

### Passo 2: Ative o Firebase Authentication

**Se for a primeira vez:**

1. Você verá uma tela com o título **"Get started"** (Começar)
2. Clique no botão **"Get started"** (Começar)
3. Isso ativará o serviço de Authentication

**Se já estiver ativado:**

1. Você verá a aba **"Sign-in method"** (Métodos de login) já selecionada
2. Pule para o Passo 3

### Passo 3: Ative o Provedor Email/Password

1. Na lista de **"Sign-in providers"** (Provedores de login), encontre **"Email/Password"**
2. Clique em **"Email/Password"**
3. Uma janela modal abrirá com opções:
   - **Toggle 1**: "Email/Password" - **ATIVE ESTE** ✅
   - **Toggle 2**: "Email link (passwordless sign-in)" - Opcional (pode deixar desativado)
4. Clique em **"Save"** (Salvar)

### Passo 4: Verifique se Está Ativado

Você deve ver na lista de provedores:
- ✅ **Email/Password** com status **"Enabled"** (Habilitado)
- ✅ Um ícone de check verde ou toggle ativado

### Passo 5: Teste Novamente

1. Volte para a aplicação: https://gastopessoal-ac9aa.web.app
2. Tente criar uma nova conta
3. O registro deve funcionar sem erros!

## 📋 Checklist

- [ ] Firebase Authentication está ativado
- [ ] Provedor Email/Password está habilitado
- [ ] Testei o registro novamente

## 🔍 Verificação Adicional

Se ainda não funcionar, verifique:

1. **Credenciais do Firebase estão corretas?**
   - Verifique `src/config/firebase.ts`
   - Confirme que `apiKey` está correto

2. **Firebase está inicializado corretamente?**
   - Verifique o console do navegador para erros
   - Confirme que não há erros de inicialização

3. **Firestore está ativado?**
   - Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore
   - Certifique-se de que o banco de dados foi criado

## 🎯 Após Ativar

Depois de ativar o Firebase Authentication:

1. O registro deve funcionar sem erros
2. O login deve funcionar corretamente
3. Os dados devem ser salvos no Firestore


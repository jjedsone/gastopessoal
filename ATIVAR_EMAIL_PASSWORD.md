# 🔐 Como Ativar Email/Password no Firebase Authentication

## ⚠️ IMPORTANTE

O erro `auth/configuration-not-found` ocorre porque o **Email/Password** não está ativado. O Google Sign-In é opcional e pode ser configurado depois.

## ✅ Passo a Passo Rápido

### 1. Acesse o Firebase Authentication

**Link direto:** https://console.firebase.google.com/project/gastopessoal-ac9aa/authentication

### 2. Vá para "Sign-in method"

1. Clique na aba **"Sign-in method"** (Métodos de login) no topo
2. Você verá uma lista de provedores disponíveis

### 3. Ative Email/Password

1. Na lista, encontre **"Email/Password"**
2. Clique em **"Email/Password"**
3. Uma janela modal abrirá
4. **Ative o primeiro toggle** (Email/Password) - este é o ESSENCIAL ✅
5. O segundo toggle (Email link) é opcional - pode deixar desativado
6. Clique em **"Salvar"** (Save)

### 4. Verifique

Você deve ver:
- ✅ **Email/Password** com status **"Enabled"** na lista
- ✅ Um ícone verde ou toggle ativado

### 5. Teste

Agora volte para a aplicação e tente criar uma conta!

## 🎯 Diferença entre Provedores

- **Email/Password** ✅ **OBRIGATÓRIO** - É o que nosso app usa
- **Google Sign-In** ⚪ Opcional - Pode ser configurado depois se desejar
- **Outros provedores** ⚪ Opcionais

## 📝 Nota sobre Google Sign-In

Se você quiser adicionar Google Sign-In depois:
- Você precisará configurar o OAuth2 no Google Cloud Console
- Mas isso é **opcional** - o Email/Password é suficiente para o app funcionar

## ✅ Checklist

- [ ] Acessei o Firebase Console
- [ ] Fui para Authentication > Sign-in method
- [ ] Ativei Email/Password
- [ ] Salvei as alterações
- [ ] Testei o registro na aplicação


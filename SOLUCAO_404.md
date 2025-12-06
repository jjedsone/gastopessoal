# Solução para Erro 404 ao Criar Conta

## 🔴 Problema

O erro 404 acontece porque as **Firebase Functions não foram deployadas**. O Firebase Hosting está tentando redirecionar `/api/**` para a função `api`, mas ela não existe.

## ✅ Soluções

### Opção 1: Deploy das Firebase Functions (Recomendado para Produção)

**Requisito**: Plano Blaze (pay-as-you-go) do Firebase

1. **Fazer upgrade para Blaze**:
   - Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/usage/details
   - Faça upgrade para o plano Blaze

2. **Fazer deploy das Functions**:
   ```bash
   firebase deploy --only functions --project gastopessoal-ac9aa
   ```

3. **Verificar se funcionou**:
   ```bash
   firebase functions:list --project gastopessoal-ac9aa
   ```

### Opção 2: Usar Servidor Local (Recomendado para Desenvolvimento)

Se você não quiser usar o plano Blaze agora, pode usar o servidor local:

1. **Iniciar o servidor local**:
   ```bash
   cd server
   npm install
   npm start
   ```
   O servidor vai rodar em `http://localhost:3001`

2. **Usar o app em desenvolvimento**:
   ```bash
   npm run dev
   ```
   O app vai rodar em `http://localhost:5173` e vai usar o servidor local automaticamente

3. **Ou configurar proxy/tunnel** (para produção sem Blaze):
   - Use ngrok ou similar para expor o servidor local
   - Configure a URL no frontend

### Opção 3: Configurar Variável de Ambiente

Você pode configurar uma variável de ambiente para usar o servidor local mesmo em produção:

1. Criar arquivo `.env` na raiz:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

## 🔧 Verificação Atual

Para verificar se as Functions estão deployadas:

```bash
firebase functions:list --project gastopessoal-ac9aa
```

Se retornar "No functions found", as Functions não estão deployadas.

## 📝 Status Atual

- ✅ Firestore Database: Configurado
- ✅ Regras de Segurança: Deploy realizado
- ✅ Índices: Deploy realizado
- ❌ Firebase Functions: **Não deployadas** (requer plano Blaze)
- ✅ Servidor Local: Pronto para uso

## 🚀 Próximos Passos

1. **Para desenvolvimento**: Use o servidor local (`cd server && npm start`)
2. **Para produção**: Faça upgrade para Blaze e deploy das Functions
3. **Alternativa**: Configure um servidor VPS/cloud e use como backend

## 💡 Dica

Para testar rapidamente sem fazer upgrade:
- Use o servidor local em desenvolvimento
- O app detecta automaticamente o ambiente e usa o servidor correto


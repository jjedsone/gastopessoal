# 🔥 Configuração Rápida do Firestore

## ✅ Passo a Passo

### 1. Obter Credenciais do Firebase

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/settings/serviceaccounts/adminsdk
2. Clique em **"Gerar nova chave privada"**
3. Baixe o arquivo JSON
4. Renomeie para `firebase-service-account.json`
5. Coloque na pasta `server/`

### 2. Instalar Dependências

```bash
cd server
npm install
```

### 3. Testar

```bash
npm start
```

Você deve ver:
```
✅ Firestore inicializado com sucesso
✅ Usando Firestore Database
🚀 Servidor rodando na porta 3001
```

## 🎯 Como Funciona

O sistema detecta automaticamente qual banco usar:

1. **Firestore** ✅ (se `firebase-service-account.json` existir)
2. **SQLite** (se Firestore não disponível)
3. **JSON** (modo desenvolvimento)

## 📊 Estrutura no Firestore

As seguintes coleções serão criadas automaticamente:

- `users` - Usuários
- `transactions` - Transações
- `budgets` - Orçamentos  
- `financial_goals` - Metas
- `custom_categories` - Categorias
- `scheduled_expenses` - Despesas agendadas

## 🔒 Segurança

✅ Regras de segurança já configuradas
✅ Usuários só acessam seus próprios dados
✅ Arquivo de credenciais protegido no `.gitignore`

## 🚀 Pronto!

Agora seu backend está usando o Firestore Database do Firebase! 🎉


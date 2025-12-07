# 🧪 Teste de Login

## ✅ Usuário de Teste Criado

**Credenciais:**
- **Username:** `teste`
- **Senha:** `123456`

## 🚀 Como Testar

### 1. Iniciar o Servidor

```bash
cd server
npm start
```

O servidor vai rodar em `http://localhost:3001`

### 2. Iniciar o Frontend

Em outro terminal:

```bash
npm run dev
```

O frontend vai rodar em `http://localhost:5173`

### 3. Fazer Login

1. Acesse: `http://localhost:5173`
2. Clique em "Entrar"
3. Use as credenciais:
   - **Nome de Usuário:** `teste`
   - **Senha:** `123456`
4. Clique em "Entrar"

## 🔍 Verificar se Funcionou

Se o login funcionar, você será redirecionado para o Dashboard e verá:
- ✅ Mensagem de sucesso: "Login realizado com sucesso!"
- ✅ Dashboard carregado com dados do usuário
- ✅ Nome do usuário no menu lateral

## 🐛 Troubleshooting

### Erro 401 (Unauthorized)

**Possíveis causas:**
1. Servidor não está rodando
2. Usuário não existe no banco de dados
3. Senha incorreta
4. Problema com o banco de dados

**Solução:**
1. Verifique se o servidor está rodando: `cd server && npm start`
2. Recrie o usuário de teste: `cd server && node create-test-user-simple.js`
3. Verifique o arquivo `server/data.json` se estiver usando JSON database

### Erro de Conexão

**Possíveis causas:**
1. Servidor não está rodando na porta 3001
2. CORS não configurado corretamente

**Solução:**
1. Verifique se o servidor está rodando
2. Verifique o console do navegador para erros de CORS

## 📝 Criar Novo Usuário

Você também pode criar uma nova conta através da interface:

1. Clique em "Criar Conta"
2. Preencha:
   - **Nome:** Seu nome completo
   - **Nome de Usuário:** (opcional, será gerado automaticamente)
   - **Senha:** Mínimo 6 caracteres
   - **Tipo:** Solteiro(a) ou Casado(a)
3. Clique em "Criar Conta"

## 🔐 Banco de Dados

O sistema usa um dos seguintes bancos (em ordem de prioridade):
1. **Firestore** (se configurado com credenciais)
2. **SQLite** (se `better-sqlite3` estiver instalado)
3. **JSON** (fallback - arquivo `server/data.json`)

Para desenvolvimento local, o JSON database é suficiente e não requer configuração adicional.


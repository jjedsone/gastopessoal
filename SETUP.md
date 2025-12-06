# 🚀 Guia de Configuração Completo

## Backend com Autenticação JWT

### Passo 1: Instalar Dependências do Backend

```bash
cd server
npm install
```

**⚠️ Problema no Windows?**
Se `better-sqlite3` não instalar, você precisa:
1. Instalar Visual Studio Build Tools (com C++ build tools)
2. Ou usar uma alternativa temporária (veja abaixo)

### Passo 2: Configurar Backend

1. Crie o arquivo `server/.env`:
```env
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao
NODE_ENV=development
```

2. Inicie o servidor:
```bash
cd server
npm start
```

### Passo 3: Configurar Frontend

1. Crie o arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:3001/api
```

2. Instale dependências (se ainda não fez):
```bash
npm install
```

3. Inicie o frontend:
```bash
npm run dev
```

## ✅ Funcionalidades Implementadas

### Backend
- ✅ Sistema de autenticação JWT
- ✅ Registro e login de usuários
- ✅ APIs RESTful para transações, orçamentos e metas
- ✅ Banco de dados SQLite
- ✅ Hash de senhas com bcrypt
- ✅ Middleware de autenticação

### Frontend
- ✅ Tela de login/registro atualizada
- ✅ Integração com APIs do backend
- ✅ Gerenciamento de tokens JWT
- ✅ Sincronização automática de dados

## 🔐 Como Usar

1. **Criar Conta:**
   - Acesse `/login`
   - Clique em "Criar Conta"
   - Preencha nome, email, senha e tipo de conta
   - Clique em "Criar Conta"

2. **Fazer Login:**
   - Acesse `/login`
   - Digite email e senha
   - Clique em "Entrar"

3. **Usar o Sistema:**
   - Todas as transações, orçamentos e metas são salvos no backend
   - Os dados são sincronizados automaticamente
   - O token JWT é armazenado no localStorage

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'better-sqlite3'"
**Solução:** Instale as dependências do backend:
```bash
cd server
npm install
```

### Erro: "Failed to connect to API"
**Solução:** Verifique se o backend está rodando na porta 3001:
```bash
cd server
npm start
```

### Erro: "Token inválido"
**Solução:** Faça logout e login novamente. O token pode ter expirado.

## 📝 Notas Importantes

- O backend deve estar rodando antes do frontend
- O token JWT expira em 7 dias
- Em produção, use um JWT_SECRET seguro
- Configure HTTPS em produção

## 🎯 Próximos Passos

- [ ] Adicionar refresh token
- [ ] Implementar recuperação de senha
- [ ] Adicionar validação de email
- [ ] Implementar rate limiting
- [ ] Adicionar logs de auditoria


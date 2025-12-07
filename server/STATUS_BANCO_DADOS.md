# 📊 Status do Banco de Dados

## 🔍 Como o Sistema Escolhe o Banco de Dados

O sistema tenta usar os bancos na seguinte ordem de prioridade:

### 1. Firestore Database (Produção)
**Quando é usado:**
- Arquivo `firebase-service-account.json` existe em `server/`
- OU variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` está configurada
- OU variável de ambiente `FIREBASE_PROJECT_ID` está configurada

**Status:** ⚠️ Não disponível (sem credenciais)

**Como configurar:**
1. Baixe o arquivo de credenciais do Firebase Console
2. Salve como `server/firebase-service-account.json`
3. OU configure `GOOGLE_APPLICATION_CREDENTIALS` apontando para o arquivo

### 2. SQLite Database (Desenvolvimento)
**Quando é usado:**
- Firestore não está disponível
- E `better-sqlite3` está instalado

**Status:** ⚠️ Não disponível (pacote não instalado)

**Como instalar:**
```bash
cd server
npm install better-sqlite3
```

**Nota:** No Windows, pode precisar de Visual Studio Build Tools.

### 3. JSON Database (Fallback)
**Quando é usado:**
- Firestore não está disponível
- E SQLite não está disponível

**Status:** ✅ **ATIVO** (modo desenvolvimento)

**Arquivo:** `server/data.json`

**Vantagens:**
- ✅ Não requer instalação adicional
- ✅ Funciona em qualquer sistema
- ✅ Perfeito para desenvolvimento local
- ✅ Dados persistem entre reinicializações

**Desvantagens:**
- ⚠️ Não recomendado para produção
- ⚠️ Performance limitada para grandes volumes

## 🎯 Banco Atual em Uso

**JSON Database** (`server/data.json`)

Este é o banco de dados que está sendo usado agora. É perfeito para desenvolvimento e testes locais.

## 📝 Dados Armazenados

O arquivo `server/data.json` contém:
- `users` - Usuários do sistema
- `transactions` - Transações financeiras
- `budgets` - Orçamentos
- `financial_goals` - Metas financeiras
- `custom_categories` - Categorias personalizadas
- `scheduled_expenses` - Despesas agendadas

## 🔧 Verificar Qual Banco Está Sendo Usado

Quando você iniciar o servidor (`npm start`), verá uma mensagem indicando qual banco está sendo usado:

```
✅ Usando JSON Database
📁 Arquivo: server/data.json
```

## 🚀 Para Produção

Para usar em produção, configure o Firestore:

1. **Opção 1: Arquivo de credenciais**
   - Baixe `firebase-service-account.json` do Firebase Console
   - Coloque em `server/firebase-service-account.json`

2. **Opção 2: Variável de ambiente**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/service-account.json"
   export FIREBASE_PROJECT_ID="gastopessoal-ac9aa"
   ```

3. **Opção 3: Firebase Functions**
   - Deploy das Functions no Firebase
   - As credenciais são gerenciadas automaticamente

## 💡 Dica

Para desenvolvimento local, o JSON database é suficiente e não requer configuração adicional!


# 🔒 Como Testar as Regras de Segurança do Firestore

## 📋 Regras Atuais

As regras atuais permitem acesso autenticado a todos os documentos:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ✅ O que essas regras fazem

- ✅ Permitem leitura e escrita para usuários autenticados
- ✅ Bloqueiam acesso para usuários não autenticados
- ✅ Aplicam-se a todas as coleções (users, transactions, budgets, etc.)

## 🧪 Como Testar Manualmente

### 1. Teste no Console do Navegador

1. Abra a aplicação: https://gastopessoal-ac9aa.web.app
2. Abra o console do navegador (F12)
3. Faça login
4. Tente criar uma transação
5. Verifique se aparece: `✅ Transação salva com sucesso`

### 2. Teste no Firebase Console

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore/rules
2. Clique em **"Simulador de regras"** (Rules Simulator)
3. Configure:
   - **Localização**: `/transactions/123`
   - **Tipo**: `write`
   - **Autenticado**: Sim
   - **UID**: Seu userId
4. Clique em **"Executar"**
5. Deve mostrar: ✅ **Permitido**

### 3. Teste sem Autenticação

1. No simulador, configure:
   - **Autenticado**: Não
2. Clique em **"Executar"**
3. Deve mostrar: ❌ **Negado**

## 🔧 Usando o Tutorial do Firebase (Opcional)

Se você quiser usar o tutorial oficial do Firebase para aprender mais sobre regras:

### No Cloud Shell (se tiver acesso):

```bash
cd ~
mkdir rules-tutorial
cd rules-tutorial
git clone https://github.com/firebase/quickstart-testing -b release
cd quickstart-testing/cs-walkthrough/
npm --prefix=functions install
```

### Localmente (no seu computador):

```bash
# Criar diretório
mkdir firestore-rules-tutorial
cd firestore-rules-tutorial

# Clonar tutorial
git clone https://github.com/firebase/quickstart-testing -b release

# Entrar no diretório
cd quickstart-testing/cs-walkthrough/

# Instalar dependências
npm --prefix=functions install
```

## 🎯 Regras Recomendadas para Produção

Para maior segurança, você pode usar regras mais específicas:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários - só podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transações - usuários só acessam suas próprias transações
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Orçamentos - usuários só acessam seus próprios orçamentos
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Metas financeiras
    match /financial_goals/{goalId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Categorias personalizadas
    match /custom_categories/{categoryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Despesas agendadas
    match /scheduled_expenses/{expenseId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## ⚠️ Importante

As regras atuais são **mais permissivas** mas funcionam para desenvolvimento. Para produção, considere usar regras mais restritivas que garantem que usuários só acessem seus próprios dados.

## 📚 Recursos

- [Documentação do Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Tutorial do Firebase](https://github.com/firebase/quickstart-testing)
- [Simulador de Regras](https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore/rules)


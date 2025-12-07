# Análise do Problema de Permissões no Registro

## 🔴 Problema Identificado

O código de registro está tentando **ler do Firestore ANTES de autenticar o usuário**, o que viola as regras de segurança.

## 📍 Localização Exata do Problema

### Arquivo: `src/services/authService.ts`

**Linha 37 - PROBLEMA:**
```typescript
// ❌ ERRO: Tenta ler do Firestore SEM autenticação
const existingUser = await usersService.getByUsername(username);
```

**Linha 44-45 - OK:**
```typescript
// ✅ OK: Cria usuário no Firebase Auth (autentica)
const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
const firebaseUser = userCredential.user;
```

**Linha 55 - OK:**
```typescript
// ✅ OK: Cria documento no Firestore DEPOIS de autenticar
const user = await usersService.create(firebaseUser.uid, userData);
```

## 🔍 Detalhamento do Problema

### Fluxo Atual (COM ERRO):

1. **Linha 37** - `usersService.getByUsername(username)`
   - ❌ Tenta fazer query no Firestore: `getDocs(query(collection(db, 'users'), where('username', '==', username)))`
   - ❌ **Usuário NÃO está autenticado ainda** (`request.auth == null`)
   - ❌ **Regra atual**: `allow read, write: if request.auth != null`
   - ❌ **Resultado**: Permission denied

2. **Linha 44** - `createUserWithEmailAndPassword()`
   - ✅ Cria usuário no Firebase Auth
   - ✅ Usuário agora está autenticado

3. **Linha 55** - `usersService.create()`
   - ✅ Tenta criar documento no Firestore
   - ✅ Usuário JÁ está autenticado
   - ✅ Deveria funcionar

### Código que Chama o Firebase:

```typescript
// src/services/authService.ts - Linha 25-68
register: async (data: {...}): Promise<{ user: User; token: string }> => {
  try {
    const username = data.username || generateUsername(data.name);
    
    // ❌ PROBLEMA AQUI - Linha 37
    // Tenta ler do Firestore SEM autenticação
    const existingUser = await usersService.getByUsername(username);
    if (existingUser) {
      throw new Error('Nome de usuário já está em uso');
    }

    // ✅ OK - Linha 44
    // Cria usuário no Firebase Auth (autentica)
    const email = usernameToEmail(username);
    const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
    const firebaseUser = userCredential.user;

    // ✅ OK - Linha 55
    // Cria documento no Firestore (usuário já autenticado)
    const userData: Omit<User, 'id'> = {
      name: data.name,
      username: username,
      type: data.type,
      partnerId: data.partnerId,
    };
    const user = await usersService.create(firebaseUser.uid, userData);

    const token = await firebaseUser.getIdToken();
    return { user, token };
  } catch (error: any) {
    // ...
  }
}
```

### Código do Serviço Firestore:

```typescript
// src/services/firestoreService.ts - Linha 60-69
getByUsername: async (username: string): Promise<User | null> => {
  // ❌ Esta query falha porque não há autenticação
  const q = query(collection(db, 'users'), where('username', '==', username));
  const querySnapshot = await getDocs(q); // ← FALHA AQUI
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}
```

## ✅ Solução Aplicada

**Correção implementada**: Removida a verificação de username duplicado (linhas 36-40)

### Mudanças realizadas:

1. **Removida a verificação prévia de username**
   - Antes: Tentava ler do Firestore antes de autenticar (causava erro de permissão)
   - Agora: Cria usuário no Firebase Auth diretamente

2. **Melhorado tratamento de erros**
   - Adicionado tratamento específico para erros de permissão
   - Mensagens de erro mais claras

### Código corrigido:

```typescript
register: async (data: {...}) => {
  const username = data.username || generateUsername(data.name);

  // ✅ Removida verificação prévia que causava erro de permissão
  // O Firebase Auth já previne emails duplicados automaticamente

  // Criar usuário no Firebase Auth (autentica primeiro)
  const email = usernameToEmail(username);
  const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
  const firebaseUser = userCredential.user;

  // Criar documento no Firestore (usuário já autenticado)
  const user = await usersService.create(firebaseUser.uid, userData);
  // ...
}
```

### Por que funciona agora:

1. ✅ Usuário é autenticado PRIMEIRO (linha 44)
2. ✅ Depois cria documento no Firestore (linha 55)
3. ✅ Firebase Auth previne emails duplicados automaticamente
4. ✅ Não há mais tentativa de leitura sem autenticação

## 🎯 Status

✅ **Problema corrigido!** O registro agora funciona corretamente com as regras de segurança do Firestore.


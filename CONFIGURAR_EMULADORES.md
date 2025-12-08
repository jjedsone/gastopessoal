# 🔥 Como Configurar os Emuladores do Firebase

## 📋 O que são Emuladores?

Os emuladores do Firebase permitem testar seu aplicativo localmente sem usar recursos reais do Firebase. Isso é útil para:
- Testar regras de segurança
- Desenvolver sem custos
- Testar offline
- Depurar problemas

## ✅ Configuração Passo a Passo

### 1. Navegar para o Diretório Correto

```powershell
# Se você está no tutorial
cd C:\firestore-rules-tutorial\quickstart-testing\cs-walkthrough

# OU se você quer configurar no seu projeto principal
cd E:\GASTOPESSOAL
```

### 2. Inicializar Emuladores

```powershell
firebase init emulators
```

### 3. Responder às Perguntas

Quando executar `firebase init emulators`, você verá:

1. **"Are you ready to proceed?"**
   - Digite: `Y` e pressione Enter

2. **"Which Firebase emulators do you want to set up?"**
   - Selecione com Espaço:
     - ✅ **Firestore Emulator** (importante para seu projeto)
     - ✅ **Authentication Emulator** (opcional, mas útil)
     - ✅ **Functions Emulator** (se usar Functions)
   - Pressione Enter para continuar

3. **"Which port do you want to use for the Firestore emulator?"**
   - Pressione Enter para usar o padrão (8080)

4. **"Which port do you want to use for the Authentication emulator?"**
   - Pressione Enter para usar o padrão (9099)

5. **"Would you like to download the emulators now?"**
   - Digite: `Y` e pressione Enter

### 4. Arquivo de Configuração Criado

O Firebase criará um arquivo `firebase.json` (ou atualizará o existente) com:

```json
{
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "auth": {
      "port": 9099
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## 🚀 Como Usar os Emuladores

### Iniciar os Emuladores

```powershell
firebase emulators:start
```

Isso iniciará:
- Firestore Emulator na porta 8080
- Authentication Emulator na porta 9099
- UI dos Emuladores na porta 4000

### Acessar a UI dos Emuladores

Abra no navegador: http://localhost:4000

Você verá:
- Firestore: dados e regras
- Authentication: usuários e tokens
- Logs: atividades dos emuladores

## 🔧 Configurar seu Projeto para Usar Emuladores

### Para Desenvolvimento Local

No seu código (`src/config/firebase.ts`), adicione:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  // ... suas configurações
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Conectar aos emuladores apenas em desenvolvimento
if (import.meta.env.DEV && !auth._delegate._config?.emulator) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## 📝 Para o Tutorial

Se você está seguindo o tutorial do Firebase:

```powershell
# No diretório do tutorial
cd C:\firestore-rules-tutorial\quickstart-testing\cs-walkthrough

# Iniciar emuladores
firebase emulators:start
```

## 🎯 Vantagens dos Emuladores

- ✅ Teste local sem custos
- ✅ Teste offline
- ✅ Reset rápido de dados
- ✅ Depuração mais fácil
- ✅ Teste de regras de segurança

## ⚠️ Importante

- Os emuladores são apenas para desenvolvimento
- Dados dos emuladores são temporários (reset ao reiniciar)
- Use o Firebase real para produção

## 🔗 Recursos

- [Documentação dos Emuladores](https://firebase.google.com/docs/emulator-suite)
- [Guia de Instalação](https://firebase.google.com/docs/emulator-suite/install_and_configure)


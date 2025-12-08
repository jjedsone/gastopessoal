# 🚀 Como Iniciar os Emuladores do Firebase

## ✅ Configuração Adicionada

Já adicionei a configuração dos emuladores no `firebase.json`. Agora você precisa:

## 📝 Passo a Passo

### 1. Para o Tutorial (onde você está agora)

```powershell
# Navegar para o diretório do tutorial
cd C:\firestore-rules-tutorial\quickstart-testing\cs-walkthrough

# Inicializar emuladores (se ainda não fez)
firebase init emulators
```

**Quando perguntar:**
- ✅ Selecione **Firestore Emulator**
- ✅ Selecione **Authentication Emulator** (opcional)
- ✅ Use portas padrão (8080 e 9099)
- ✅ Baixe os emuladores quando perguntar

### 2. Para seu Projeto Principal

```powershell
# Navegar para seu projeto
cd E:\GASTOPESSOAL

# Inicializar emuladores
firebase init emulators
```

**Quando perguntar:**
- ✅ Selecione **Firestore Emulator**
- ✅ Selecione **Authentication Emulator** (opcional)
- ✅ Use portas padrão
- ✅ Baixe os emuladores

### 3. Iniciar os Emuladores

Depois de configurar, inicie com:

```powershell
firebase emulators:start
```

Isso iniciará:
- 🔥 Firestore Emulator na porta **8080**
- 🔐 Authentication Emulator na porta **9099**
- 🖥️ UI dos Emuladores na porta **4000**

### 4. Acessar a UI

Abra no navegador: **http://localhost:4000**

Você verá:
- Interface visual dos emuladores
- Dados do Firestore
- Usuários do Authentication
- Logs em tempo real

## 🎯 Comandos Úteis

```powershell
# Iniciar emuladores
firebase emulators:start

# Iniciar apenas Firestore
firebase emulators:start --only firestore

# Iniciar Firestore e Auth
firebase emulators:start --only firestore,auth

# Parar emuladores
# Pressione Ctrl+C no terminal
```

## ⚠️ Importante

- Os emuladores rodam **localmente** no seu computador
- Dados são **temporários** (reset ao reiniciar)
- Use apenas para **desenvolvimento e testes**
- Para produção, use o Firebase real

## 🔧 Próximos Passos

1. Execute `firebase init emulators` no diretório desejado
2. Selecione os emuladores que quer usar
3. Execute `firebase emulators:start`
4. Acesse http://localhost:4000 para ver a UI

## 📚 Documentação

- [Guia Completo](CONFIGURAR_EMULADORES.md)
- [Documentação Oficial](https://firebase.google.com/docs/emulator-suite)


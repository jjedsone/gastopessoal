# Instalação do Backend

## Opção 1: Usar SQLite (Recomendado)

### Windows
1. Instale o Visual Studio Build Tools:
   - Baixe em: https://visualstudio.microsoft.com/downloads/
   - Selecione "Build Tools for Visual Studio"
   - Instale o componente "C++ build tools"

2. Instale o Windows SDK:
   - Durante a instalação do Visual Studio, selecione "Windows 10 SDK" ou superior

3. Execute:
```bash
cd server
npm install
```

### Linux/Mac
```bash
cd server
npm install
```

## Opção 2: Usar JSON (Desenvolvimento Simples)

Se tiver problemas com SQLite, você pode usar arquivos JSON temporariamente editando `server/database.js` para usar um sistema de arquivos simples.

## Executar

```bash
cd server
npm start
```

O servidor estará disponível em `http://localhost:3001`


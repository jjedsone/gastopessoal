# 💰 Gasto Pessoal - Gestão Financeira Inteligente

Sistema completo de gestão financeira pessoal desenvolvido em React com TypeScript, projetado para ajudar pessoas solteiras e casadas a organizar suas finanças, economizar dinheiro e tomar decisões de investimento inteligentes.

## 🚀 Funcionalidades

### ✨ Principais Recursos

- **Gestão de Transações**: Registre todas as suas receitas e despesas de forma organizada
- **Dashboard Intuitivo**: Visualize sua situação financeira com gráficos e métricas em tempo real
- **Orçamentos Personalizados**: Crie e acompanhe orçamentos por categoria
- **Assistente IA Avançado**: Receba recomendações personalizadas sobre economia e investimentos
- **Sugestões de Investimentos**: Descubra opções de investimento adequadas ao seu perfil
- **Suporte para Casais**: Funcionalidade especial para casais gerenciarem finanças compartilhadas
- **Interface Moderna**: Design responsivo e intuitivo

### 🎯 Para Casais

- Compartilhamento de dados financeiros
- Visualização conjunta de receitas e despesas
- Planejamento financeiro em conjunto
- Recomendações personalizadas para o casal

### 🤖 Assistente IA

O assistente IA oferece:
- Análise de padrões de gastos
- Recomendações de economia
- Sugestões de redução de custos
- Orientação sobre investimentos
- Planejamento orçamentário inteligente

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório ou navegue até a pasta do projeto:
```bash
cd GASTOPESSOAL
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra seu navegador em `http://localhost:5173`

## 📦 Build para Produção

Para criar uma build de produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 🏗️ Estrutura do Projeto

```
GASTOPESSOAL/
├── src/
│   ├── components/       # Componentes React
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Budgets.tsx
│   │   ├── AIAssistant.tsx
│   │   ├── Investments.tsx
│   │   ├── Profile.tsx
│   │   └── Login.tsx
│   ├── context/          # Context API para gerenciamento de estado
│   │   └── FinanceContext.tsx
│   ├── types/            # Definições TypeScript
│   │   └── index.ts
│   ├── utils/            # Funções utilitárias
│   │   └── format.ts
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Ponto de entrada
│   └── index.css         # Estilos globais
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 💡 Como Usar

### 1. Primeiro Acesso

- Ao abrir o sistema, você será direcionado para a tela de login
- Escolha entre conta individual (Solteiro) ou compartilhada (Casado)
- Preencha seus dados e comece a usar

### 2. Registrando Transações

- Vá para a aba "Transações"
- Clique em "Nova Transação"
- Preencha os dados: tipo (receita/despesa), categoria, valor, descrição e data
- Salve e acompanhe no dashboard

### 3. Criando Orçamentos

- Acesse "Orçamentos"
- Crie orçamentos por categoria
- Defina limites mensais ou semanais
- Acompanhe o progresso em tempo real

### 4. Consultando o Assistente IA

- Vá para "Assistente IA"
- Veja recomendações personalizadas baseadas nos seus dados
- Use o chat para fazer perguntas sobre suas finanças
- Receba dicas de economia e investimento

### 5. Explorando Investimentos

- Acesse "Investimentos"
- Veja sugestões baseadas no seu perfil e disponibilidade
- Compare diferentes opções de investimento
- Entenda riscos e rentabilidades esperadas

## 🎨 Tecnologias Utilizadas

- **React 18**: Biblioteca JavaScript para construção de interfaces
- **TypeScript**: Tipagem estática para JavaScript
- **Vite**: Build tool moderna e rápida
- **React Router**: Roteamento para aplicações React
- **Recharts**: Biblioteca de gráficos para React
- **Lucide React**: Ícones modernos
- **Context API**: Gerenciamento de estado global
- **LocalStorage**: Persistência de dados no navegador

## 📊 Métricas e Visualizações

O dashboard oferece:
- Total de receitas e despesas
- Saldo atual
- Taxa de poupança
- Gráficos de receitas vs despesas (últimos 7 dias)
- Distribuição de gastos por categoria
- Alertas de orçamento ultrapassado

## 🔒 Privacidade e Segurança

- Todos os dados são armazenados localmente no navegador (LocalStorage)
- Nenhum dado é enviado para servidores externos
- Você tem controle total sobre suas informações financeiras

## 🚧 Melhorias Futuras

- [ ] Sincronização em nuvem
- [ ] Exportação de relatórios em PDF
- [ ] Integração com bancos via API
- [ ] Notificações de lembretes
- [ ] Metas de economia personalizadas
- [ ] Histórico de investimentos
- [ ] Análise de tendências de longo prazo

## 📝 Licença

Este projeto é de código aberto e está disponível para uso pessoal.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

Desenvolvido com ❤️ para ajudar você a alcançar seus objetivos financeiros!

# gastopessoal

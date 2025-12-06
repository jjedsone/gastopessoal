/**
 * Base de conhecimento financeiro para o assistente IA
 */

export interface FinancialTip {
  category: string;
  tips: string[];
  bestPractices: string[];
}

export const financialKnowledge: Record<string, FinancialTip> = {
  economia: {
    category: 'Economia e Poupança',
    tips: [
      'A regra 50/30/20: 50% para necessidades, 30% para desejos, 20% para poupança',
      'Crie um fundo de emergência equivalente a 6 meses de despesas',
      'Automatize transferências para poupança no início do mês',
      'Use a técnica do "envelope": separe dinheiro físico por categoria',
      'Revise assinaturas e serviços mensais regularmente',
      'Aplique a regra dos 30 dias: espere 30 dias antes de compras não essenciais',
      'Negocie contas recorrentes (internet, telefone, seguro) anualmente',
    ],
    bestPractices: [
      'Pague-se primeiro: transfira para poupança antes de gastar',
      'Acompanhe cada centavo gasto por pelo menos um mês',
      'Estabeleça metas de economia específicas e mensuráveis',
      'Celebre pequenas vitórias financeiras',
    ],
  },
  investimentos: {
    category: 'Investimentos',
    tips: [
      'Comece com investimentos de baixo risco antes de diversificar',
      'Diversifique entre diferentes tipos de ativos',
      'Invista regularmente (dollar-cost averaging)',
      'Não invista dinheiro que você pode precisar em curto prazo',
      'Considere investimentos passivos como ETFs para reduzir custos',
      'Reinvista dividendos e juros para aproveitar juros compostos',
      'Revise e rebalanceie sua carteira anualmente',
      'Entenda a relação risco/retorno antes de investir',
    ],
    bestPractices: [
      'Siga a regra 100 - idade: % em ações = 100 - sua idade',
      'Mantenha uma reserva de emergência antes de investir',
      'Não tente cronometrar o mercado',
      'Foque no longo prazo e ignore volatilidade de curto prazo',
    ],
  },
  orçamento: {
    category: 'Orçamento e Planejamento',
    tips: [
      'Use o método zero-sum: cada real deve ter um destino',
      'Revise seu orçamento mensalmente',
      'Ajuste o orçamento conforme sua situação muda',
      'Crie categorias específicas, não genéricas',
      'Inclua uma categoria para "imprevistos"',
      'Use aplicativos ou planilhas para acompanhar',
      'Estabeleça limites realistas, não ideais',
    ],
    bestPractices: [
      'Planeje baseado em valores reais, não estimativas',
      'Revise gastos passados para criar orçamentos futuros',
      'Inclua todas as receitas e despesas, mesmo pequenas',
      'Ajuste gradualmente, não mude tudo de uma vez',
    ],
  },
  dívidas: {
    category: 'Gestão de Dívidas',
    tips: [
      'Priorize dívidas com maior taxa de juros',
      'Considere consolidar dívidas com taxas altas',
      'Negocie prazos e taxas com credores',
      'Evite fazer novas dívidas enquanto paga as existentes',
      'Use o método avalanche: pague a dívida com maior taxa primeiro',
      'Use o método bola de neve: pague a menor dívida primeiro para motivação',
      'Considere transferir dívidas para cartões com menor taxa',
    ],
    bestPractices: [
      'Nunca use crédito para pagar crédito',
      'Pague mais que o mínimo sempre que possível',
      'Mantenha um histórico de pagamentos positivo',
      'Evite usar crédito rotativo',
    ],
  },
  aposentadoria: {
    category: 'Planejamento para Aposentadoria',
    tips: [
      'Comece a investir para aposentadoria o mais cedo possível',
      'Aproveite juros compostos investindo cedo',
      'Considere contribuir para previdência privada',
      'Diversifique investimentos para aposentadoria',
      'Revise seus objetivos de aposentadoria anualmente',
      'Calcule quanto você precisa para se aposentar confortavelmente',
      'Considere múltiplas fontes de renda na aposentadoria',
    ],
    bestPractices: [
      'Use a regra dos 4%: retire 4% do patrimônio anualmente',
      'Planeje para viver até 90+ anos',
      'Considere inflação nos cálculos',
      'Não dependa apenas da previdência social',
    ],
  },
};

/**
 * Gera resposta inteligente baseada em contexto
 */
export const generateContextualResponse = (
  question: string,
  context: {
    savingsRate: number;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    hasDebt: boolean;
    investmentAmount: number;
  }
): string => {
  const lowerQuestion = question.toLowerCase();
  let response = '';

  // Análise de economia
  if (lowerQuestion.includes('economizar') || lowerQuestion.includes('poupar') || lowerQuestion.includes('poupança')) {
    response = `Com base na sua situação atual:\n\n`;
    response += `📊 **Sua situação:** Você está poupando ${context.savingsRate.toFixed(1)}% da sua renda.\n\n`;
    
    if (context.savingsRate < 20) {
      response += `⚠️ **Recomendação:** Sua taxa de poupança está abaixo do ideal (20%). Aqui estão estratégias específicas:\n\n`;
      response += `1. **Automatize a poupança:** Configure transferência automática de ${(context.totalIncome * 0.2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no início de cada mês\n`;
      response += `2. **Reduza despesas:** Você gasta ${context.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} por mês. Uma redução de 10% economizaria ${(context.totalExpenses * 0.1).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
      
      if (context.topCategories.length > 0) {
        response += `3. **Foque em:** ${context.topCategories[0].category} representa ${context.topCategories[0].percentage.toFixed(1)}% dos seus gastos\n`;
      }
      
      response += `\n💡 **Dica Pro:** Use a regra 50/30/20 - 50% necessidades, 30% desejos, 20% poupança/investimentos.\n`;
    } else {
      response += `✅ **Parabéns!** Você está no caminho certo. Para otimizar ainda mais:\n\n`;
      response += `1. Considere aumentar para 25-30% se possível\n`;
      response += `2. Automatize investimentos regulares\n`;
      response += `3. Revise despesas trimestralmente para encontrar mais oportunidades\n`;
    }
    
    response += `\n${financialKnowledge.economia.tips.slice(0, 3).map((tip, i) => `${i + 1}. ${tip}`).join('\n')}`;
  }

  // Análise de investimentos
  else if (lowerQuestion.includes('investir') || lowerQuestion.includes('investimento') || lowerQuestion.includes('aplicar')) {
    response = `💼 **Estratégia de Investimentos Personalizada:**\n\n`;
    
    if (context.balance > 0) {
      response += `💰 Você tem ${context.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} disponível para investir.\n\n`;
      
      if (context.balance < 1000) {
        response += `**Recomendação Conservadora:**\n`;
        response += `- Tesouro Selic: Ideal para começar, liquidez diária\n`;
        response += `- CDB: Boa rentabilidade com baixo risco\n`;
        response += `- Foque em construir reserva de emergência primeiro\n\n`;
      } else if (context.balance < 10000) {
        response += `**Estratégia Moderada:**\n`;
        response += `- 40% Tesouro Selic (reserva de emergência)\n`;
        response += `- 40% CDB ou Fundos de Renda Fixa\n`;
        response += `- 20% Ações/ETFs (diversificação)\n\n`;
      } else {
        response += `**Estratégia Diversificada:**\n`;
        response += `- 30% Renda Fixa (segurança)\n`;
        response += `- 40% Ações/ETFs (crescimento)\n`;
        response += `- 20% Fundos Imobiliários (diversificação)\n`;
        response += `- 10% Reserva de emergência\n\n`;
      }
    } else {
      response += `⚠️ Antes de investir, é importante:\n`;
      response += `1. Criar um fundo de emergência\n`;
      response += `2. Eliminar dívidas com juros altos\n`;
      response += `3. Ter controle sobre suas despesas\n\n`;
    }
    
    response += `📚 **Princípios Fundamentais:**\n`;
    response += financialKnowledge.investimentos.tips.slice(0, 4).map((tip, i) => `${i + 1}. ${tip}`).join('\n');
  }

  // Análise de gastos
  else if (lowerQuestion.includes('gastar') || lowerQuestion.includes('despesa') || lowerQuestion.includes('gasto')) {
    response = `📉 **Análise dos Seus Gastos:**\n\n`;
    
    if (context.topCategories.length > 0) {
      response += `**Principais Categorias:**\n`;
      context.topCategories.slice(0, 3).forEach((cat, i) => {
        response += `${i + 1}. ${cat.category}: ${cat.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${cat.percentage.toFixed(1)}% da renda)\n`;
      });
      response += `\n`;
      
      const topCategory = context.topCategories[0];
      if (topCategory.percentage > 30) {
        response += `⚠️ **Atenção:** ${topCategory.category} representa ${topCategory.percentage.toFixed(1)}% da sua renda, acima do recomendado (30%).\n\n`;
        response += `**Ações Recomendadas:**\n`;
        response += `1. Revise todos os gastos nesta categoria\n`;
        response += `2. Negocie melhores preços\n`;
        response += `3. Procure alternativas mais econômicas\n`;
        response += `4. Estabeleça um limite mensal\n\n`;
      }
    }
    
    response += `💡 **Dicas para Reduzir Gastos:**\n`;
    response += `1. Use a regra dos 30 dias para compras não essenciais\n`;
    response += `2. Compare preços antes de comprar\n`;
    response += `3. Revise assinaturas e serviços mensais\n`;
    response += `4. Negocie contas anualmente\n`;
  }

  // Planejamento orçamentário
  else if (lowerQuestion.includes('orçamento') || lowerQuestion.includes('planejamento') || lowerQuestion.includes('planejar')) {
    response = `📋 **Guia de Planejamento Orçamentário:**\n\n`;
    response += `**Sua Situação Atual:**\n`;
    response += `- Receitas: ${context.totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
    response += `- Despesas: ${context.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
    response += `- Saldo: ${context.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`;
    
    response += `**Regra 50/30/20 Recomendada:**\n`;
    response += `- 50% (${(context.totalIncome * 0.5).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) → Necessidades\n`;
    response += `- 30% (${(context.totalIncome * 0.3).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) → Desejos\n`;
    response += `- 20% (${(context.totalIncome * 0.2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) → Poupança/Investimentos\n\n`;
    
    response += `**Passos para Criar um Orçamento Eficaz:**\n`;
    response += financialKnowledge.orçamento.tips.slice(0, 5).map((tip, i) => `${i + 1}. ${tip}`).join('\n');
  }

  // Resposta genérica inteligente
  else {
    response = `Olá! Sou seu assistente financeiro inteligente com conhecimento avançado em gestão financeira pessoal.\n\n`;
    response += `**Posso ajudar você com:**\n`;
    response += `💰 Estratégias de economia e poupança\n`;
    response += `📈 Planejamento de investimentos\n`;
    response += `📉 Análise e redução de gastos\n`;
    response += `📋 Criação e otimização de orçamentos\n`;
    response += `🎯 Metas financeiras e planejamento\n`;
    response += `💡 Dicas personalizadas baseadas nos seus dados\n\n`;
    response += `**Faça perguntas como:**\n`;
    response += `- "Como posso economizar mais?"\n`;
    response += `- "Onde devo investir meu dinheiro?"\n`;
    response += `- "Como reduzir meus gastos?"\n`;
    response += `- "Me ajude a criar um orçamento"\n`;
    response += `- "Analise minha situação financeira"\n\n`;
    response += `💬 Digite sua pergunta e receba recomendações personalizadas!`;
  }

  return response;
};


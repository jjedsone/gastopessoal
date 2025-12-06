/**
 * Especialista em Corte de Gastos e Organização Financeira
 * IA com experiência avançada em reduzir despesas e reorganizar finanças
 */

import { Transaction, Budget } from '../types';
import { SpendingPattern } from './financialAnalysis';

export interface CostCuttingPlan {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  currentSpending: number;
  targetSpending: number;
  potentialSavings: number;
  strategies: CostCuttingStrategy[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: string;
  impact: 'high' | 'medium' | 'low';
}

export interface CostCuttingStrategy {
  title: string;
  description: string;
  savings: number;
  steps: string[];
  tips: string[];
  warnings?: string[];
}

export interface FinancialReorganizationPlan {
  emergencyActions: string[];
  shortTermPlan: {
    timeframe: string;
    actions: string[];
    expectedSavings: number;
  };
  mediumTermPlan: {
    timeframe: string;
    actions: string[];
    expectedSavings: number;
  };
  longTermPlan: {
    timeframe: string;
    actions: string[];
    expectedSavings: number;
  };
  totalPotentialSavings: number;
}

/**
 * Analisa situação crítica de despesas altas
 */
export const analyzeHighExpenses = (
  totalIncome: number,
  totalExpenses: number,
  spendingPatterns: SpendingPattern[],
  transactions: Transaction[]
): { isCritical: boolean; severity: 'critical' | 'high' | 'medium'; analysis: string } => {
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const balance = totalIncome - totalExpenses;
  
  let isCritical = false;
  let severity: 'critical' | 'high' | 'medium' = 'medium';
  const analysisParts: string[] = [];
  
  // Análise de severidade
  if (expenseRatio > 100) {
    isCritical = true;
    severity = 'critical';
    analysisParts.push(`🚨 SITUAÇÃO CRÍTICA: Você está gastando ${expenseRatio.toFixed(1)}% da sua renda!`);
    analysisParts.push(`Déficit mensal: R$ ${Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  } else if (expenseRatio > 90) {
    isCritical = true;
    severity = 'critical';
    analysisParts.push(`⚠️ ALERTA CRÍTICO: Gastos representam ${expenseRatio.toFixed(1)}% da renda`);
    analysisParts.push(`Margem muito pequena: apenas R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sobram`);
  } else if (expenseRatio > 80) {
    severity = 'high';
    analysisParts.push(`⚠️ ATENÇÃO: Gastos em ${expenseRatio.toFixed(1)}% da renda`);
    analysisParts.push(`Sobra apenas R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  } else if (expenseRatio > 70) {
    severity = 'medium';
    analysisParts.push(`📊 Gastos em ${expenseRatio.toFixed(1)}% da renda - Acima do ideal`);
  }
  
  // Identificar categorias problemáticas
  const problematicCategories = spendingPatterns.filter(p => p.percentageOfIncome > 30);
  if (problematicCategories.length > 0) {
    analysisParts.push(`\n🔴 Categorias Críticas:`);
    problematicCategories.forEach(cat => {
      analysisParts.push(`- ${cat.category}: ${cat.percentageOfIncome.toFixed(1)}% da renda (${cat.trend === 'increasing' ? '📈 Aumentando' : ''})`);
    });
  }
  
  // Gastos recorrentes pequenos
  const smallRecurring = transactions
    .filter(t => t.type === 'expense' && t.amount < 50)
    .reduce((sum, t) => sum + t.amount, 0);
  
  if (smallRecurring > totalIncome * 0.1) {
    analysisParts.push(`\n💸 Gastos Pequenos Recorrentes: R$ ${smallRecurring.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    analysisParts.push(`Esses pequenos gastos somam ${((smallRecurring / totalIncome) * 100).toFixed(1)}% da sua renda!`);
  }
  
  return {
    isCritical: isCritical || severity === 'high',
    severity,
    analysis: analysisParts.join('\n'),
  };
};

/**
 * Cria plano completo de corte de gastos
 */
export const createCostCuttingPlan = (
  totalIncome: number,
  _totalExpenses: number,
  spendingPatterns: SpendingPattern[],
  _transactions: Transaction[],
  _budgets: Budget[]
): CostCuttingPlan[] => {
  const plans: CostCuttingPlan[] = [];
  
  // Ordenar padrões por impacto potencial
  const sortedPatterns = [...spendingPatterns].sort((a, b) => {
    // Priorizar: maior % da renda, tendência crescente, maior valor absoluto
    let scoreA = a.percentageOfIncome;
    if (a.trend === 'increasing') scoreA *= 1.3;
    scoreA += a.total / totalIncome;
    
    let scoreB = b.percentageOfIncome;
    if (b.trend === 'increasing') scoreB *= 1.3;
    scoreB += b.total / totalIncome;
    
    return scoreB - scoreA;
  });
  
  // Criar plano para cada categoria problemática
  sortedPatterns.forEach((pattern, index) => {
    if (pattern.percentageOfIncome > 20 || index < 5) {
      const currentSpending = pattern.total;
      const targetSpending = currentSpending * 0.85; // Redução de 15%
      const potentialSavings = currentSpending - targetSpending;
      
      const strategies = generateStrategiesForCategory(
        pattern.category,
        currentSpending,
        pattern.count,
        pattern.trend
      );
      
      let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      if (pattern.percentageOfIncome > 40) priority = 'critical';
      else if (pattern.percentageOfIncome > 30) priority = 'high';
      
      plans.push({
        priority,
        category: pattern.category,
        currentSpending,
        targetSpending,
        potentialSavings,
        strategies,
        difficulty: pattern.percentageOfIncome > 35 ? 'medium' : 'easy',
        timeToImplement: '1-2 semanas',
        impact: potentialSavings > totalIncome * 0.05 ? 'high' : 'medium',
      });
    }
  });
  
  return plans;
};

/**
 * Gera estratégias específicas por categoria
 */
const generateStrategiesForCategory = (
  category: string,
  currentSpending: number,
  transactionCount: number,
  _trend: 'increasing' | 'decreasing' | 'stable'
): CostCuttingStrategy[] => {
  const strategies: CostCuttingStrategy[] = [];
  const categoryLower = category.toLowerCase();
  
  // Estratégias genéricas sempre aplicáveis
  strategies.push({
    title: 'Negociação e Comparação de Preços',
    description: 'Compare preços e negocie melhores condições',
    savings: currentSpending * 0.10,
    steps: [
      'Pesquise pelo menos 3 fornecedores diferentes',
      'Use sites de comparação de preços',
      'Negocie desconto por pagamento à vista',
      'Peça desconto para clientes antigos',
      'Considere comprar em maior quantidade (se fizer sentido)',
    ],
    tips: [
      'Muitas empresas oferecem desconto se você mencionar concorrentes',
      'Pagamento à vista pode gerar 5-15% de desconto',
      'Negocie anualmente contratos de serviços',
    ],
  });
  
  // Estratégias específicas por categoria
  if (categoryLower.includes('alimentação') || categoryLower.includes('alimentacao')) {
    strategies.push({
      title: 'Otimização de Compras de Alimentação',
      description: 'Estratégias específicas para reduzir gastos com comida',
      savings: currentSpending * 0.20,
      steps: [
        'Planeje refeições semanais antes de comprar',
        'Faça lista de compras e siga rigorosamente',
        'Compre produtos da estação (mais baratos)',
        'Use cupons e aproveite promoções',
        'Prefira marcas próprias de supermercados',
        'Evite compras quando estiver com fome',
        'Congele alimentos para evitar desperdício',
        'Cozinhe mais em casa e reduza delivery',
      ],
      tips: [
        'Delivery pode custar 2-3x mais que cozinhar',
        'Compras planejadas reduzem desperdício em até 30%',
        'Marca própria tem qualidade similar e custa 20-40% menos',
      ],
    });
    
    strategies.push({
      title: 'Redução de Delivery e Restaurantes',
      description: 'Limite refeições fora de casa',
      savings: currentSpending * 0.30,
      steps: [
        'Estabeleça limite de R$ X por mês em delivery',
        'Cozinhe em maior quantidade e congele',
        'Prepare lanches para o trabalho',
        'Use aplicativos de cashback quando pedir',
        'Prefira restaurantes self-service (mais barato)',
      ],
      tips: [
        'Um delivery de R$ 50 custa o mesmo que 3-4 refeições caseiras',
        'Cozinhar em casa pode economizar até 70%',
      ],
    });
  }
  
  if (categoryLower.includes('transporte')) {
    strategies.push({
      title: 'Otimização de Transporte',
      description: 'Reduza custos de locomoção',
      savings: currentSpending * 0.25,
      steps: [
        'Use transporte público quando possível',
        'Compartilhe carona para trabalho',
        'Planeje rotas para evitar trânsito',
        'Mantenha o carro em bom estado (economiza combustível)',
        'Use aplicativos de carona compartilhada',
        'Considere bicicleta para trajetos curtos',
        'Negocie plano de transporte público anual',
      ],
      tips: [
        'Carona compartilhada pode reduzir custos em 50%',
        'Transporte público é até 80% mais barato que carro próprio',
        'Manutenção preventiva economiza combustível',
      ],
    });
  }
  
  if (categoryLower.includes('moradia')) {
    strategies.push({
      title: 'Redução de Custos de Moradia',
      description: 'Otimize gastos com casa',
      savings: currentSpending * 0.15,
      steps: [
        'Negocie aluguel anualmente',
        'Reduza consumo de energia (lâmpadas LED, desligue aparelhos)',
        'Reduza consumo de água (chuveiros, torneiras)',
        'Negocie condomínio',
        'Considere mudança para área mais barata (se viável)',
        'Use energia solar se possível',
        'Isolamento térmico reduz ar condicionado/aquecedor',
      ],
      tips: [
        'Lâmpadas LED consomem 80% menos energia',
        'Negociação pode reduzir aluguel em 5-10%',
        'Pequenas mudanças podem reduzir conta de luz em 20-30%',
      ],
    });
  }
  
  if (categoryLower.includes('saúde')) {
    strategies.push({
      title: 'Otimização de Gastos com Saúde',
      description: 'Reduza custos mantendo qualidade',
      savings: currentSpending * 0.20,
      steps: [
        'Use plano de saúde quando disponível',
        'Compare preços de medicamentos em diferentes farmácias',
        'Use genéricos quando possível',
        'Negocie descontos em consultas particulares',
        'Prevenção é mais barata que tratamento',
        'Use programas de desconto de farmácias',
      ],
      tips: [
        'Genéricos custam 30-70% menos que originais',
        'Plano de saúde pode ser mais barato que particular',
        'Prevenção reduz custos futuros drasticamente',
      ],
    });
  }
  
  if (categoryLower.includes('lazer') || categoryLower.includes('compras')) {
    strategies.push({
      title: 'Controle de Gastos com Lazer e Compras',
      description: 'Mantenha diversão sem comprometer orçamento',
      savings: currentSpending * 0.40,
      steps: [
        'Estabeleça orçamento mensal específico',
        'Use regra dos 30 dias para compras não essenciais',
        'Procure atividades gratuitas ou baratas',
        'Aproveite promoções e liquidações',
        'Evite compras por impulso',
        'Use lista de desejos antes de comprar',
        'Compare preços online antes de comprar',
      ],
      tips: [
        'Esperar 30 dias reduz compras por impulso em 60%',
        'Atividades gratuitas podem ser tão divertidas quanto pagas',
        'Promoções podem economizar até 50%',
      ],
    });
  }
  
  // Estratégia para gastos recorrentes pequenos
  if (transactionCount > 10 && currentSpending / transactionCount < 50) {
    strategies.push({
      title: 'Consolidação de Pequenos Gastos',
      description: 'Reduza frequência de pequenas compras',
      savings: currentSpending * 0.25,
      steps: [
        'Identifique padrões de pequenos gastos',
        'Consolide compras quando possível',
        'Estabeleça limite diário para pequenos gastos',
        'Use regra: "Se custa menos de R$ X, pense 2x"',
        'Acompanhe esses gastos separadamente',
      ],
      tips: [
        'Pequenos gastos somam muito ao final do mês',
        'Consolidação pode reduzir custos em 20-30%',
      ],
    });
  }
  
  return strategies;
};

/**
 * Cria plano completo de reorganização financeira
 */
export const createFinancialReorganizationPlan = (
  totalIncome: number,
  totalExpenses: number,
  _spendingPatterns: SpendingPattern[],
  costCuttingPlans: CostCuttingPlan[]
): FinancialReorganizationPlan => {
  const emergencyActions: string[] = [];
  
  // Ações de emergência
  if (totalExpenses > totalIncome) {
    emergencyActions.push('🚨 PARAR TODAS AS COMPRAS NÃO ESSENCIAIS IMEDIATAMENTE');
    emergencyActions.push('🚨 Cancelar assinaturas não essenciais (streaming, revistas, etc)');
    emergencyActions.push('🚨 Reduzir delivery/restaurantes a zero temporariamente');
    emergencyActions.push('🚨 Usar apenas transporte público ou carona');
    emergencyActions.push('🚨 Negociar todas as contas recorrentes (internet, telefone, etc)');
    emergencyActions.push('🚨 Vender itens não utilizados');
    emergencyActions.push('🚨 Considerar trabalho extra ou freelance');
  } else if (totalExpenses > totalIncome * 0.90) {
    emergencyActions.push('⚠️ Reduzir gastos não essenciais em 50%');
    emergencyActions.push('⚠️ Cancelar pelo menos 2 assinaturas');
    emergencyActions.push('⚠️ Limitar delivery a 1x por semana');
    emergencyActions.push('⚠️ Negociar todas as contas');
  }
  
  // Calcular economias potenciais
  const shortTermSavings = costCuttingPlans
    .filter(p => p.priority === 'critical' || p.priority === 'high')
    .reduce((sum, p) => sum + p.potentialSavings, 0);
  
  const mediumTermSavings = costCuttingPlans
    .filter(p => p.priority === 'medium')
    .reduce((sum, p) => sum + p.potentialSavings, 0);
  
  const longTermSavings = costCuttingPlans
    .filter(p => p.priority === 'low')
    .reduce((sum, p) => sum + p.potentialSavings, 0);
  
  // Plano de curto prazo (1-2 semanas)
  const shortTermActions: string[] = [];
  costCuttingPlans
    .filter(p => p.priority === 'critical' || p.priority === 'high')
    .slice(0, 3)
    .forEach(plan => {
      shortTermActions.push(`Reduzir ${plan.category}: Meta de R$ ${plan.targetSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
      if (plan.strategies.length > 0) {
        shortTermActions.push(`  → ${plan.strategies[0].title}`);
      }
    });
  shortTermActions.push('Negociar todas as contas recorrentes');
  shortTermActions.push('Cancelar assinaturas não essenciais');
  shortTermActions.push('Estabelecer limites diários de gastos');
  
  // Plano de médio prazo (1-3 meses)
  const mediumTermActions: string[] = [];
  costCuttingPlans
    .filter(p => p.priority === 'medium')
    .slice(0, 3)
    .forEach(plan => {
      mediumTermActions.push(`Otimizar ${plan.category}: Economizar R$ ${plan.potentialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    });
  mediumTermActions.push('Implementar sistema de orçamento rigoroso');
  mediumTermActions.push('Revisar e renegociar contratos');
  mediumTermActions.push('Criar fundo de emergência');
  
  // Plano de longo prazo (3-6 meses)
  const longTermActions: string[] = [];
  longTermActions.push('Manter disciplina financeira');
  longTermActions.push('Automatizar poupança');
  longTermActions.push('Diversificar fontes de renda');
  longTermActions.push('Investir em educação financeira');
  longTermActions.push('Revisar e ajustar plano trimestralmente');
  
  return {
    emergencyActions,
    shortTermPlan: {
      timeframe: '1-2 semanas',
      actions: shortTermActions,
      expectedSavings: shortTermSavings,
    },
    mediumTermPlan: {
      timeframe: '1-3 meses',
      actions: mediumTermActions,
      expectedSavings: mediumTermSavings,
    },
    longTermPlan: {
      timeframe: '3-6 meses',
      actions: longTermActions,
      expectedSavings: longTermSavings,
    },
    totalPotentialSavings: shortTermSavings + mediumTermSavings + longTermSavings,
  };
};

/**
 * Gera resposta especializada para situação de despesas altas
 */
export const generateExpertCostCuttingResponse = (
  totalIncome: number,
  totalExpenses: number,
  spendingPatterns: SpendingPattern[],
  transactions: Transaction[],
  budgets: Budget[]
): string => {
  const analysis = analyzeHighExpenses(totalIncome, totalExpenses, spendingPatterns, transactions);
  const costCuttingPlans = createCostCuttingPlan(totalIncome, totalExpenses, spendingPatterns, transactions, budgets);
  const reorganizationPlan = createFinancialReorganizationPlan(totalIncome, totalExpenses, spendingPatterns, costCuttingPlans);
  
  const parts: string[] = [];
  
  parts.push(`🎯 **ESPECIALISTA EM CORTE DE GASTOS ATIVADO**\n`);
  parts.push(analysis.analysis);
  
  parts.push(`\n📋 **PLANO DE AÇÃO COMPLETO**\n`);
  
  // Ações de emergência
  if (reorganizationPlan.emergencyActions.length > 0) {
    parts.push(`🚨 **AÇÕES DE EMERGÊNCIA (AGORA):**`);
    reorganizationPlan.emergencyActions.forEach(action => {
      parts.push(`- ${action}`);
    });
    parts.push(``);
  }
  
  // Plano de curto prazo
  parts.push(`⚡ **CURTO PRAZO (${reorganizationPlan.shortTermPlan.timeframe}):**`);
  parts.push(`Economia esperada: R$ ${reorganizationPlan.shortTermPlan.expectedSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  reorganizationPlan.shortTermPlan.actions.forEach(action => {
    parts.push(`- ${action}`);
  });
  parts.push(``);
  
  // Planos por categoria
  parts.push(`📊 **PLANOS POR CATEGORIA (Prioridade):**\n`);
  costCuttingPlans.slice(0, 5).forEach((plan) => {
    const priorityIcon = plan.priority === 'critical' ? '🔴' : plan.priority === 'high' ? '🟠' : '🟡';
    parts.push(`${priorityIcon} **${plan.category}**`);
    parts.push(`   - Atual: R$ ${plan.currentSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    parts.push(`   - Meta: R$ ${plan.targetSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    parts.push(`   - Economia: R$ ${plan.potentialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    
    if (plan.strategies.length > 0) {
      parts.push(`   **Estratégias:**`);
      plan.strategies.slice(0, 2).forEach(strategy => {
        parts.push(`   → ${strategy.title}: Economia de R$ ${strategy.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        if (strategy.steps.length > 0) {
          parts.push(`     Passos: ${strategy.steps.slice(0, 2).join(', ')}`);
        }
      });
    }
    parts.push(``);
  });
  
  // Plano de médio prazo
  parts.push(`📅 **MÉDIO PRAZO (${reorganizationPlan.mediumTermPlan.timeframe}):**`);
  parts.push(`Economia adicional: R$ ${reorganizationPlan.mediumTermPlan.expectedSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  reorganizationPlan.mediumTermPlan.actions.forEach(action => {
    parts.push(`- ${action}`);
  });
  parts.push(``);
  
  // Resumo de impacto
  parts.push(`💰 **IMPACTO TOTAL ESPERADO:**`);
  parts.push(`- Economia Total Potencial: R$ ${reorganizationPlan.totalPotentialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  parts.push(`- Nova Taxa de Despesas: ${(((totalExpenses - reorganizationPlan.totalPotentialSavings) / totalIncome) * 100).toFixed(1)}%`);
  parts.push(`- Nova Sobra Mensal: R$ ${(totalIncome - totalExpenses + reorganizationPlan.totalPotentialSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  
  // Dicas finais
  parts.push(`\n💡 **DICAS DO ESPECIALISTA:**`);
  parts.push(`1. Comece pelas ações de emergência se situação crítica`);
  parts.push(`2. Implemente uma estratégia por vez para não se sobrecarregar`);
  parts.push(`3. Acompanhe resultados semanalmente`);
  parts.push(`4. Celebre pequenas vitórias para manter motivação`);
  parts.push(`5. Revise e ajuste o plano mensalmente`);
  
  return parts.join('\n');
};


import { Transaction, Budget } from '../types';

export interface SpendingPattern {
  category: string;
  total: number;
  average: number;
  count: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageOfIncome: number;
}

export interface FinancialInsight {
  type: 'spending_pattern' | 'savings_opportunity' | 'risk_alert' | 'optimization';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: number; // Impacto financeiro estimado
  confidence: number; // Confiança na análise (0-100)
  recommendations: string[];
  data: any;
}

export interface TrendAnalysis {
  period: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

/**
 * Analisa padrões de gastos por categoria
 */
export const analyzeSpendingPatterns = (
  transactions: Transaction[],
  totalIncome: number
): SpendingPattern[] => {
  const categoryData: Record<string, { amounts: number[]; total: number }> = {};
  
  // Agrupar por categoria
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = { amounts: [], total: 0 };
      }
      categoryData[t.category].amounts.push(t.amount);
      categoryData[t.category].total += t.amount;
    });

  // Analisar tendências (últimos 3 meses vs anteriores)
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  
  const recentTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= threeMonthsAgo && t.type === 'expense';
  });

  const olderTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date < threeMonthsAgo && t.type === 'expense';
  });

  const recentCategoryTotals: Record<string, number> = {};
  const olderCategoryTotals: Record<string, number> = {};

  recentTransactions.forEach(t => {
    recentCategoryTotals[t.category] = (recentCategoryTotals[t.category] || 0) + t.amount;
  });

  olderTransactions.forEach(t => {
    olderCategoryTotals[t.category] = (olderCategoryTotals[t.category] || 0) + t.amount;
  });

  return Object.entries(categoryData).map(([category, data]) => {
    const average = data.amounts.length > 0 
      ? data.total / data.amounts.length 
      : 0;
    
    const recentTotal = recentCategoryTotals[category] || 0;
    const olderTotal = olderCategoryTotals[category] || 0;
    const olderMonths = Math.max(1, Math.floor((now.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const recentMonths = 3;
    
    const recentMonthly = recentTotal / recentMonths;
    const olderMonthly = olderTotal / olderMonths;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentMonthly > olderMonthly * 1.1) {
      trend = 'increasing';
    } else if (recentMonthly < olderMonthly * 0.9) {
      trend = 'decreasing';
    }

    return {
      category,
      total: data.total,
      average,
      count: data.amounts.length,
      trend,
      percentageOfIncome: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
    };
  }).sort((a, b) => b.total - a.total);
};

/**
 * Analisa tendências financeiras ao longo do tempo
 */
export const analyzeTrends = (transactions: Transaction[]): TrendAnalysis[] => {
  const now = new Date();
  const trends: TrendAnalysis[] = [];
  
  // Analisar últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    trends.push({
      period: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      income,
      expenses,
      savings,
      savingsRate,
    });
  }

  return trends;
};

/**
 * Identifica oportunidades de economia
 */
export const identifySavingsOpportunities = (
  transactions: Transaction[],
  budgets: Budget[],
  totalIncome: number
): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  const patterns = analyzeSpendingPatterns(transactions, totalIncome);

  // Oportunidade 1: Categorias com gastos excessivos
  patterns.forEach(pattern => {
    if (pattern.percentageOfIncome > 30 && pattern.trend === 'increasing') {
      const potentialSavings = pattern.total * 0.15; // 15% de redução possível
      
      insights.push({
        type: 'savings_opportunity',
        title: `Oportunidade de economia em ${pattern.category}`,
        description: `Você está gastando ${pattern.percentageOfIncome.toFixed(1)}% da sua renda em ${pattern.category}, e essa categoria está aumentando. Uma redução de 15% economizaria aproximadamente ${potentialSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} por mês.`,
        severity: 'high',
        impact: potentialSavings,
        confidence: 75,
        recommendations: [
          `Negocie melhores preços em ${pattern.category}`,
          `Compare fornecedores e procure promoções`,
          `Considere alternativas mais econômicas`,
          `Estabeleça um limite mensal para esta categoria`,
        ],
        data: pattern,
      });
    }
  });

  // Oportunidade 2: Gastos pequenos recorrentes que somam muito
  const smallRecurringExpenses: Record<string, { count: number; total: number }> = {};
  transactions
    .filter(t => t.type === 'expense' && t.amount < 50)
    .forEach(t => {
      if (!smallRecurringExpenses[t.category]) {
        smallRecurringExpenses[t.category] = { count: 0, total: 0 };
      }
      smallRecurringExpenses[t.category].count++;
      smallRecurringExpenses[t.category].total += t.amount;
    });

  Object.entries(smallRecurringExpenses).forEach(([category, data]) => {
    if (data.count > 10 && data.total > totalIncome * 0.05) {
      insights.push({
        type: 'savings_opportunity',
        title: `Gastos pequenos recorrentes em ${category}`,
        description: `Você tem ${data.count} transações pequenas em ${category} somando ${data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Pequenos gastos frequentes podem impactar significativamente seu orçamento.`,
        severity: 'medium',
        impact: data.total * 0.2,
        confidence: 80,
        recommendations: [
          'Consolide pequenos gastos quando possível',
          'Use um limite diário para gastos pequenos',
          'Acompanhe esses gastos com mais atenção',
          'Considere alternativas gratuitas ou mais baratas',
        ],
        data: { category, ...data },
      });
    }
  });

  // Oportunidade 3: Orçamentos ultrapassados
  budgets.forEach(budget => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const spent = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' &&
               t.category === budget.category &&
               date.getMonth() === currentMonth &&
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (spent > budget.limit) {
      const excess = spent - budget.limit;
      insights.push({
        type: 'risk_alert',
        title: `Orçamento ultrapassado: ${budget.category}`,
        description: `Você ultrapassou o orçamento de ${budget.category} em ${excess.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${((excess / budget.limit) * 100).toFixed(1)}% acima do limite).`,
        severity: 'high',
        impact: excess,
        confidence: 100,
        recommendations: [
          'Revise gastos nesta categoria imediatamente',
          'Ajuste o orçamento se necessário',
          'Identifique gastos não essenciais para cortar',
          'Compense em outras categorias',
        ],
        data: { budget, spent, excess },
      });
    }
  });

  return insights;
};

/**
 * Analisa saúde financeira geral
 */
export const analyzeFinancialHealth = (
  transactions: Transaction[],
  totalIncome: number,
  totalExpenses: number,
  savingsRate: number
): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  const balance = totalIncome - totalExpenses;

  // Análise de saúde financeira
  if (savingsRate < 10) {
    insights.push({
      type: 'risk_alert',
      title: 'Taxa de poupança muito baixa',
      description: `Sua taxa de poupança atual é ${savingsRate.toFixed(1)}%, muito abaixo do recomendado (20%). Isso pode comprometer sua segurança financeira futura.`,
      severity: 'critical',
      impact: totalIncome * 0.1, // Potencial de aumentar em 10%
      confidence: 90,
      recommendations: [
        'Estabeleça uma meta de poupar pelo menos 20% da renda',
        'Crie um fundo de emergência equivalente a 6 meses de despesas',
        'Automatize transferências para poupança',
        'Revise e corte despesas não essenciais',
      ],
      data: { savingsRate, recommended: 20 },
    });
  }

  if (balance < 0) {
    insights.push({
      type: 'risk_alert',
      title: 'Gastos superando receitas',
      description: `Você está gastando mais do que ganha. Isso é insustentável a longo prazo e pode levar a dívidas.`,
      severity: 'critical',
      impact: Math.abs(balance),
      confidence: 100,
      recommendations: [
        'Reduza despesas imediatamente',
        'Identifique e corte gastos não essenciais',
        'Considere aumentar sua renda',
        'Crie um plano de recuperação financeira',
      ],
      data: { balance, deficit: Math.abs(balance) },
    });
  }

  // Análise de estabilidade de renda
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const incomeVariation = calculateVariation(incomeTransactions.map(t => t.amount));
  
  if (incomeVariation > 0.3) {
    insights.push({
      type: 'risk_alert',
      title: 'Renda instável detectada',
      description: `Sua renda apresenta alta variação (${(incomeVariation * 100).toFixed(1)}%). Considere criar uma reserva maior para períodos de menor renda.`,
      severity: 'medium',
      impact: totalIncome * 0.2,
      confidence: 70,
      recommendations: [
        'Aumente seu fundo de emergência para 9-12 meses',
        'Diversifique fontes de renda',
        'Planeje gastos baseado na renda média, não máxima',
        'Mantenha um orçamento conservador',
      ],
      data: { variation: incomeVariation },
    });
  }

  return insights;
};

/**
 * Calcula coeficiente de variação
 */
const calculateVariation = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return mean > 0 ? stdDev / mean : 0;
};

/**
 * Gera recomendações inteligentes baseadas em análise completa
 */
export const generateIntelligentRecommendations = (
  transactions: Transaction[],
  budgets: Budget[],
  totalIncome: number,
  totalExpenses: number,
  savingsRate: number
): FinancialInsight[] => {
  const allInsights: FinancialInsight[] = [];

  // Análise de saúde financeira
  allInsights.push(...analyzeFinancialHealth(transactions, totalIncome, totalExpenses, savingsRate));

  // Oportunidades de economia
  allInsights.push(...identifySavingsOpportunities(transactions, budgets, totalIncome));

  // Ordenar por severidade e impacto
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  return allInsights.sort((a, b) => {
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.impact - a.impact;
  });
};


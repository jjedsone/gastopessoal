/**
 * Sistema de IA Avançado - Processamento de Linguagem Natural e Análise Profunda
 */

import { Transaction, Budget } from '../types';
import { SpendingPattern, FinancialInsight, TrendAnalysis } from './financialAnalysis';
import { generateExpertCostCuttingResponse, analyzeHighExpenses } from './costCuttingExpert';

export interface ConversationContext {
  userProfile: {
    savingsRate: number;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    financialGoals: string[];
    timeHorizon: 'short' | 'medium' | 'long';
  };
  conversationHistory: Array<{ role: 'user' | 'ai'; content: string; timestamp: Date }>;
  identifiedNeeds: string[];
  previousRecommendations: string[];
}

export interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  context: string[];
}

/**
 * Analisa a intenção do usuário usando processamento de linguagem natural avançado
 */
export const analyzeIntent = (message: string): IntentAnalysis => {
  const lowerMessage = message.toLowerCase();
  const words = lowerMessage.split(/\s+/);
  
  // Padrões de intenção com palavras-chave e sinônimos
  const intentPatterns: Record<string, { keywords: string[]; synonyms: string[]; weight: number }> = {
    economia: {
      keywords: ['economizar', 'poupar', 'poupança', 'economia', 'guardar', 'reservar'],
      synonyms: ['reduzir gastos', 'cortar custos', 'diminuir despesas', 'aumentar sobra'],
      weight: 1.0,
    },
    investimentos: {
      keywords: ['investir', 'investimento', 'aplicar', 'aplicação', 'rendimento', 'rentabilidade'],
      synonyms: ['onde investir', 'melhor investimento', 'onde aplicar', 'fazer dinheiro render'],
      weight: 1.0,
    },
    gastos: {
      keywords: ['gastar', 'gasto', 'despesa', 'despesas', 'onde gasto', 'gastos'],
      synonyms: ['reduzir gastos', 'controlar gastos', 'analisar gastos', 'cortar gastos'],
      weight: 0.9,
    },
    orçamento: {
      keywords: ['orçamento', 'planejamento', 'planejar', 'organizar', 'controlar'],
      synonyms: ['criar orçamento', 'fazer orçamento', 'planejamento financeiro', 'organizar finanças'],
      weight: 0.9,
    },
    dívidas: {
      keywords: ['dívida', 'dívidas', 'dever', 'emprestimo', 'financiamento', 'parcela'],
      synonyms: ['pagar dívidas', 'quitar dívidas', 'eliminar dívidas', 'reduzir dívidas'],
      weight: 0.8,
    },
    aposentadoria: {
      keywords: ['aposentadoria', 'aposentar', 'futuro', 'longo prazo', 'aposentado'],
      synonyms: ['planejar aposentadoria', 'preparar futuro', 'investir para futuro'],
      weight: 0.8,
    },
    análise: {
      keywords: ['analisar', 'análise', 'avaliar', 'situação', 'como estou', 'diagnóstico'],
      synonyms: ['minha situação', 'como está', 'avaliar situação', 'diagnóstico financeiro'],
      weight: 0.9,
    },
    metas: {
      keywords: ['meta', 'metas', 'objetivo', 'objetivos', 'alcançar', 'conseguir'],
      synonyms: ['definir metas', 'estabelecer objetivos', 'alcançar meta', 'planejar objetivo'],
      weight: 0.8,
    },
    emergência: {
      keywords: ['emergência', 'reserva', 'fundo', 'imprevisto', 'segurança'],
      synonyms: ['fundo de emergência', 'reserva de emergência', 'segurança financeira'],
      weight: 0.9,
    },
    comparação: {
      keywords: ['comparar', 'comparação', 'diferença', 'versus', 'vs', 'melhor'],
      synonyms: ['qual melhor', 'comparar opções', 'diferença entre'],
      weight: 0.7,
    },
  };

  // Calcular confiança para cada intenção
  const intentScores: Record<string, number> = {};
  
  Object.entries(intentPatterns).forEach(([intent, pattern]) => {
    let score = 0;
    
    // Verificar palavras-chave
    pattern.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        score += pattern.weight;
      }
    });
    
    // Verificar sinônimos (frases completas)
    pattern.synonyms.forEach(synonym => {
      if (lowerMessage.includes(synonym)) {
        score += pattern.weight * 1.2; // Sinônimos têm peso maior
      }
    });
    
    // Verificar palavras individuais
    words.forEach(word => {
      if (pattern.keywords.some(kw => kw.includes(word) || word.includes(kw))) {
        score += pattern.weight * 0.5;
      }
    });
    
    if (score > 0) {
      intentScores[intent] = score;
    }
  });

  // Encontrar intenção com maior confiança
  const sortedIntents = Object.entries(intentScores).sort((a, b) => b[1] - a[1]);
  const topIntent = sortedIntents[0];
  
  // Extrair entidades (valores, categorias, períodos, etc.)
  const entities: Record<string, any> = {};
  
  // Extrair valores monetários
  const moneyRegex = /(?:r\$|reais?|rs\.?)\s*(\d+(?:[.,]\d+)?)/gi;
  const moneyMatches = message.match(moneyRegex);
  if (moneyMatches) {
    entities.money = moneyMatches.map(m => parseFloat(m.replace(/[^\d.,]/g, '').replace(',', '.')));
  }
  
  // Extrair categorias mencionadas
  const categories = ['alimentação', 'transporte', 'moradia', 'saúde', 'educação', 'lazer', 'compras'];
  categories.forEach(cat => {
    if (lowerMessage.includes(cat)) {
      entities.category = cat;
    }
  });
  
  // Extrair períodos temporais
  const timePatterns = {
    mês: 'month',
    meses: 'months',
    ano: 'year',
    anos: 'years',
    semana: 'week',
    semanas: 'weeks',
  };
  Object.entries(timePatterns).forEach(([pt, en]) => {
    if (lowerMessage.includes(pt)) {
      entities.timePeriod = en;
    }
  });

  // Identificar contexto adicional
  const context: string[] = [];
  if (lowerMessage.includes('urgente') || lowerMessage.includes('rápido')) context.push('urgent');
  if (lowerMessage.includes('detalhado') || lowerMessage.includes('completo')) context.push('detailed');
  if (lowerMessage.includes('simples') || lowerMessage.includes('básico')) context.push('simple');
  if (lowerMessage.includes('exemplo') || lowerMessage.includes('exemplos')) context.push('examples');

  return {
    intent: topIntent ? topIntent[0] : 'geral',
    confidence: topIntent ? Math.min(topIntent[1] / 3, 1) : 0.3,
    entities,
    context,
  };
};

/**
 * Gera resposta avançada baseada em múltiplos fatores
 */
export const generateAdvancedResponse = (
  _message: string,
  intent: IntentAnalysis,
  context: ConversationContext,
  transactions: Transaction[],
  budgets: Budget[],
  spendingPatterns: SpendingPattern[],
  trends: TrendAnalysis[],
  insights: FinancialInsight[]
): string => {
  const responseParts: string[] = [];
  
  // Verificar se situação é crítica (despesas muito altas)
  const expenseAnalysis = analyzeHighExpenses(
    context.userProfile.totalIncome,
    context.userProfile.totalExpenses,
    spendingPatterns,
    transactions
  );
  
  // Se situação crítica, ativar especialista em corte de gastos
  if (expenseAnalysis.isCritical || intent.intent === 'gastos' || intent.intent === 'economia') {
    if (expenseAnalysis.severity === 'critical' || context.userProfile.totalExpenses > context.userProfile.totalIncome * 0.90) {
      return generateExpertCostCuttingResponse(
        context.userProfile.totalIncome,
        context.userProfile.totalExpenses,
        spendingPatterns,
        transactions,
        budgets
      );
    }
  }
  
  // Saudação contextual se for início de conversa
  if (context.conversationHistory.length === 0) {
    responseParts.push(`Olá! Sou seu consultor financeiro especializado com IA avançada.`);
    responseParts.push(`Analisei seus dados financeiros e estou pronto para ajudar com análises profundas e recomendações personalizadas.\n`);
  }

  // Resposta baseada na intenção detectada
  switch (intent.intent) {
    case 'análise':
      responseParts.push(generateComprehensiveAnalysis(context, transactions, spendingPatterns, trends, insights));
      break;
    
    case 'economia':
      // Se situação crítica, focar em corte de gastos primeiro
      if (expenseAnalysis.isCritical || context.userProfile.totalExpenses > context.userProfile.totalIncome * 0.85) {
        responseParts.push(generateExpertCostCuttingResponse(
          context.userProfile.totalIncome,
          context.userProfile.totalExpenses,
          spendingPatterns,
          transactions,
          budgets
        ));
      } else {
        responseParts.push(generateSavingsStrategy(context, spendingPatterns, insights));
      }
      break;
    
    case 'investimentos':
      responseParts.push(generateInvestmentAdvice(context, intent.entities));
      break;
    
    case 'gastos':
      // Se gastos muito altos, usar especialista
      if (expenseAnalysis.isCritical || context.userProfile.totalExpenses > context.userProfile.totalIncome * 0.85) {
        responseParts.push(generateExpertCostCuttingResponse(
          context.userProfile.totalIncome,
          context.userProfile.totalExpenses,
          spendingPatterns,
          transactions,
          budgets
        ));
      } else {
        responseParts.push(generateSpendingAnalysis(context, spendingPatterns, intent.entities));
      }
      break;
    
    case 'orçamento':
      responseParts.push(generateBudgetGuidance(context, budgets, transactions));
      break;
    
    case 'dívidas':
      responseParts.push(generateDebtStrategy(context));
      break;
    
    case 'aposentadoria':
      responseParts.push(generateRetirementPlanning(context));
      break;
    
    case 'emergência':
      responseParts.push(generateEmergencyFundAdvice(context, transactions));
      break;
    
    case 'metas':
      responseParts.push(generateGoalPlanning(context, intent.entities));
      break;
    
    case 'comparação':
      responseParts.push(generateComparison(context, intent.entities));
      break;
    
    default:
      responseParts.push(generateGeneralResponse(context, intent));
  }

  // Adicionar insights relevantes se houver
  const relevantInsights = insights.filter(i => 
    i.severity === 'critical' || i.severity === 'high'
  ).slice(0, 2);
  
  if (relevantInsights.length > 0 && intent.intent !== 'análise') {
    responseParts.push(`\n⚠️ **Alerta Importante:**`);
    relevantInsights.forEach(insight => {
      responseParts.push(`\n**${insight.title}**\n${insight.description}`);
    });
  }

  // Adicionar perguntas de follow-up inteligentes
  const followUpQuestions = generateFollowUpQuestions(intent, context);
  if (followUpQuestions.length > 0) {
    responseParts.push(`\n💡 **Perguntas para aprofundar:**`);
    followUpQuestions.forEach((q, i) => {
      responseParts.push(`${i + 1}. ${q}`);
    });
  }

  return responseParts.join('\n\n');
};

/**
 * Gera análise financeira abrangente
 */
const generateComprehensiveAnalysis = (
  context: ConversationContext,
  _transactions: Transaction[],
  patterns: SpendingPattern[],
  trends: TrendAnalysis[],
  insights: FinancialInsight[]
): string => {
  const parts: string[] = [];
  
  parts.push(`📊 **ANÁLISE FINANCEIRA COMPLETA**\n`);
  
  // Situação atual
  parts.push(`**1. SITUAÇÃO FINANCEIRA ATUAL**`);
  parts.push(`- Receitas Mensais: R$ ${context.userProfile.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`- Despesas Mensais: R$ ${context.userProfile.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`- Saldo: R$ ${context.userProfile.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`- Taxa de Poupança: ${context.userProfile.savingsRate.toFixed(1)}%`);
  
  // Avaliação de saúde financeira
  let healthScore = 100;
  let healthIssues: string[] = [];
  
  if (context.userProfile.savingsRate < 10) {
    healthScore -= 30;
    healthIssues.push('Taxa de poupança muito baixa');
  } else if (context.userProfile.savingsRate < 20) {
    healthScore -= 15;
    healthIssues.push('Taxa de poupança abaixo do ideal');
  }
  
  if (context.userProfile.balance < 0) {
    healthScore -= 40;
    healthIssues.push('Gastos superando receitas');
  }
  
  if (patterns.some(p => p.percentageOfIncome > 40)) {
    healthScore -= 20;
    healthIssues.push('Concentração excessiva de gastos em uma categoria');
  }
  
  parts.push(`\n**2. SCORE DE SAÚDE FINANCEIRA: ${healthScore}/100**`);
  if (healthIssues.length > 0) {
    parts.push(`Pontos de atenção:`);
    healthIssues.forEach(issue => parts.push(`- ${issue}`));
  }
  
  // Análise de padrões
  parts.push(`\n**3. ANÁLISE DE PADRÕES DE GASTOS**`);
  const top3 = patterns.slice(0, 3);
  top3.forEach((pattern, i) => {
    const trendIcon = pattern.trend === 'increasing' ? '📈' : pattern.trend === 'decreasing' ? '📉' : '➡️';
    parts.push(`${i + 1}. ${pattern.category}: ${trendIcon} ${(pattern.percentageOfIncome).toFixed(1)}% da renda`);
    if (pattern.trend === 'increasing' && pattern.percentageOfIncome > 25) {
      parts.push(`   ⚠️ Atenção: Esta categoria está aumentando e já representa uma parcela significativa`);
    }
  });
  
  // Tendências temporais
  if (trends.length >= 3) {
    parts.push(`\n**4. TENDÊNCIAS TEMPORAIS (Últimos ${trends.length} meses)**`);
    const recentTrend = trends.slice(-3);
    const firstRate = recentTrend[0].savingsRate;
    const lastRate = recentTrend[recentTrend.length - 1].savingsRate;
    
    if (lastRate > firstRate * 1.1) {
      parts.push(`✅ Tendência positiva: Taxa de poupança aumentando`);
    } else if (lastRate < firstRate * 0.9) {
      parts.push(`⚠️ Tendência negativa: Taxa de poupança diminuindo`);
    } else {
      parts.push(`➡️ Estabilidade: Taxa de poupança estável`);
    }
  }
  
  // Insights críticos
  const criticalInsights = insights.filter(i => i.severity === 'critical' || i.severity === 'high');
  if (criticalInsights.length > 0) {
    parts.push(`\n**5. INSIGHTS CRÍTICOS**`);
    criticalInsights.slice(0, 3).forEach((insight, i) => {
      parts.push(`${i + 1}. **${insight.title}**`);
      parts.push(`   ${insight.description}`);
      parts.push(`   Impacto estimado: R$ ${insight.impact.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    });
  }
  
  // Recomendações prioritárias
  parts.push(`\n**6. RECOMENDAÇÕES PRIORITÁRIAS**`);
  if (context.userProfile.savingsRate < 20) {
    parts.push(`1. 🎯 Aumentar taxa de poupança para pelo menos 20%`);
    parts.push(`   Meta: Economizar R$ ${(context.userProfile.totalIncome * 0.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  }
  if (context.userProfile.balance < 0) {
    parts.push(`2. 🚨 Reduzir despesas imediatamente`);
    parts.push(`   Necessário cortar: R$ ${Math.abs(context.userProfile.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  }
  if (patterns.some(p => p.percentageOfIncome > 30)) {
    const problematic = patterns.find(p => p.percentageOfIncome > 30)!;
    parts.push(`3. 📉 Reduzir gastos em ${problematic.category}`);
    parts.push(`   Atualmente: ${problematic.percentageOfIncome.toFixed(1)}% da renda`);
  }
  
  return parts.join('\n');
};

/**
 * Gera estratégia de economia personalizada
 */
const generateSavingsStrategy = (
  context: ConversationContext,
  patterns: SpendingPattern[],
  _insights: FinancialInsight[]
): string => {
  const parts: string[] = [];
  const targetSavings = context.userProfile.totalIncome * 0.2;
  const currentSavings = context.userProfile.balance;
  const gap = targetSavings - currentSavings;
  
  parts.push(`💰 **ESTRATÉGIA DE ECONOMIA PERSONALIZADA**\n`);
  parts.push(`**Situação Atual:**`);
  parts.push(`- Você está poupando ${context.userProfile.savingsRate.toFixed(1)}% da sua renda`);
  parts.push(`- Valor atual: R$ ${currentSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  parts.push(`- Meta recomendada: R$ ${targetSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (20%)`);
  
  if (gap > 0) {
    parts.push(`- Gap para meta: R$ ${gap.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês\n`);
    
    parts.push(`**PLANO DE AÇÃO EM 3 ETAPAS:**\n`);
    
    // Etapa 1: Redução de gastos
    const topExpense = patterns[0];
    if (topExpense && topExpense.percentageOfIncome > 20) {
      const potentialSavings = topExpense.total * 0.15;
      parts.push(`**ETAPA 1: Reduzir ${topExpense.category}**`);
      parts.push(`- Atualmente: R$ ${topExpense.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${topExpense.percentageOfIncome.toFixed(1)}% da renda)`);
      parts.push(`- Meta: Reduzir 15% = R$ ${potentialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
      parts.push(`- Como: Negociar preços, comparar fornecedores, eliminar gastos desnecessários\n`);
    }
    
    // Etapa 2: Otimização de outras categorias
    const otherSavings = patterns.slice(1, 3).reduce((sum, p) => sum + (p.total * 0.1), 0);
    if (otherSavings > 0) {
      parts.push(`**ETAPA 2: Otimizar outras categorias**`);
      parts.push(`- Potencial: R$ ${otherSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
      parts.push(`- Foco: ${patterns.slice(1, 3).map(p => p.category).join(', ')}\n`);
    }
    
    // Etapa 3: Automatização
    parts.push(`**ETAPA 3: Automatizar poupança**`);
    parts.push(`- Configure transferência automática no dia do pagamento`);
    parts.push(`- Valor sugerido: R$ ${(gap * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`- Use a regra: "Pague-se primeiro"\n`);
    
    parts.push(`**RESULTADO ESPERADO:**`);
    parts.push(`- Economia adicional: R$ ${(gap * 0.8).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    parts.push(`- Nova taxa de poupança: ${((currentSavings + gap * 0.8) / context.userProfile.totalIncome * 100).toFixed(1)}%`);
  } else {
    parts.push(`\n✅ **Parabéns!** Você já está acima da meta recomendada.`);
    parts.push(`Considere aumentar para 25-30% para acelerar seus objetivos financeiros.`);
  }
  
  return parts.join('\n');
};

/**
 * Gera conselho de investimento avançado
 */
const generateInvestmentAdvice = (
  context: ConversationContext,
  _entities: Record<string, any>
): string => {
  const parts: string[] = [];
  const available = Math.max(0, context.userProfile.balance);
  const monthlyIncome = context.userProfile.totalIncome;
  
  parts.push(`📈 **ESTRATÉGIA DE INVESTIMENTOS PERSONALIZADA**\n`);
  
  // Determinar perfil de risco baseado em dados
  let riskProfile: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
  if (context.userProfile.savingsRate < 10) riskProfile = 'conservative';
  if (context.userProfile.savingsRate > 30 && available > monthlyIncome * 3) riskProfile = 'aggressive';
  
  parts.push(`**SEU PERFIL:** ${riskProfile === 'conservative' ? 'Conservador' : riskProfile === 'moderate' ? 'Moderado' : 'Agressivo'}`);
  parts.push(`- Capital disponível: R$ ${available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`- Renda mensal: R$ ${monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
  
  // Estratégia por perfil
  if (riskProfile === 'conservative') {
    parts.push(`**ALOCAÇÃO RECOMENDADA (Conservador):**`);
    parts.push(`1. **40% - Reserva de Emergência**`);
    parts.push(`   - Tesouro Selic ou CDB com liquidez diária`);
    parts.push(`   - Valor: R$ ${(available * 0.4).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`   - Objetivo: Segurança e liquidez\n`);
    
    parts.push(`2. **50% - Renda Fixa**`);
    parts.push(`   - CDB, LCI, LCA, Debêntures`);
    parts.push(`   - Valor: R$ ${(available * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`   - Rentabilidade esperada: 12-14% ao ano\n`);
    
    parts.push(`3. **10% - Diversificação**`);
    parts.push(`   - Fundos de Renda Fixa ou ETFs`);
    parts.push(`   - Valor: R$ ${(available * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  } else if (riskProfile === 'moderate') {
    parts.push(`**ALOCAÇÃO RECOMENDADA (Moderado):**`);
    parts.push(`1. **30% - Reserva de Emergência**`);
    parts.push(`   - Tesouro Selic`);
    parts.push(`   - Valor: R$ ${(available * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
    
    parts.push(`2. **40% - Renda Fixa**`);
    parts.push(`   - CDB, Fundos de Renda Fixa`);
    parts.push(`   - Valor: R$ ${(available * 0.4).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
    
    parts.push(`3. **30% - Renda Variável**`);
    parts.push(`   - Ações, ETFs, Fundos Imobiliários`);
    parts.push(`   - Valor: R$ ${(available * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`   - Rentabilidade esperada: 15-18% ao ano`);
  } else {
    parts.push(`**ALOCAÇÃO RECOMENDADA (Agressivo):**`);
    parts.push(`1. **20% - Reserva de Emergência**`);
    parts.push(`   - Valor: R$ ${(available * 0.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
    
    parts.push(`2. **30% - Renda Fixa**`);
    parts.push(`   - Valor: R$ ${(available * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
    
    parts.push(`3. **50% - Renda Variável**`);
    parts.push(`   - Ações individuais, ETFs, FIIs, Criptomoedas`);
    parts.push(`   - Valor: R$ ${(available * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`   - Rentabilidade esperada: 18-25% ao ano (com maior risco)`);
  }
  
  parts.push(`\n**PRINCÍPIOS FUNDAMENTAIS:**`);
  parts.push(`✓ Diversificação é essencial`);
  parts.push(`✓ Invista regularmente (dollar-cost averaging)`);
  parts.push(`✓ Foque no longo prazo`);
  parts.push(`✓ Revise sua carteira anualmente`);
  parts.push(`✓ Não invista dinheiro que precisa em curto prazo`);
  
  return parts.join('\n');
};

/**
 * Gera análise de gastos detalhada
 */
const generateSpendingAnalysis = (
  context: ConversationContext,
  patterns: SpendingPattern[],
  entities: Record<string, any>
): string => {
  const parts: string[] = [];
  const category = entities.category;
  
  parts.push(`📉 **ANÁLISE DETALHADA DE GASTOS**\n`);
  
  if (category && patterns.find(p => p.category.toLowerCase() === category)) {
    const pattern = patterns.find(p => p.category.toLowerCase() === category)!;
    parts.push(`**ANÁLISE: ${pattern.category.toUpperCase()}**\n`);
    parts.push(`- Total gasto: R$ ${pattern.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`- % da renda: ${pattern.percentageOfIncome.toFixed(1)}%`);
    parts.push(`- Média por transação: R$ ${pattern.average.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`- Número de transações: ${pattern.count}`);
    parts.push(`- Tendência: ${pattern.trend === 'increasing' ? '📈 Aumentando' : pattern.trend === 'decreasing' ? '📉 Diminuindo' : '➡️ Estável'}\n`);
    
    if (pattern.percentageOfIncome > 30) {
      parts.push(`⚠️ **ATENÇÃO:** Esta categoria representa mais de 30% da sua renda!\n`);
      parts.push(`**ESTRATÉGIAS DE REDUÇÃO:**`);
      parts.push(`1. Negocie melhores preços`);
      parts.push(`2. Compare pelo menos 3 fornecedores`);
      parts.push(`3. Procure promoções e descontos`);
      parts.push(`4. Considere alternativas mais econômicas`);
      parts.push(`5. Estabeleça um limite mensal de R$ ${(context.userProfile.totalIncome * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    }
  } else {
    parts.push(`**VISÃO GERAL DOS GASTOS:**\n`);
    patterns.slice(0, 5).forEach((pattern, i) => {
      const trendIcon = pattern.trend === 'increasing' ? '📈' : pattern.trend === 'decreasing' ? '📉' : '➡️';
      parts.push(`${i + 1}. **${pattern.category}**`);
      parts.push(`   - R$ ${pattern.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${pattern.percentageOfIncome.toFixed(1)}% da renda) ${trendIcon}`);
      if (pattern.percentageOfIncome > 30) {
        parts.push(`   ⚠️ Acima do recomendado (30%)`);
      }
      parts.push(``);
    });
    
    parts.push(`**RECOMENDAÇÕES GERAIS:**`);
    parts.push(`- Foque em reduzir as 3 principais categorias`);
    parts.push(`- Use a regra 50/30/20 como referência`);
    parts.push(`- Revise gastos pequenos recorrentes`);
  }
  
  return parts.join('\n');
};

/**
 * Gera orientação de orçamento
 */
const generateBudgetGuidance = (
  context: ConversationContext,
  budgets: Budget[],
  transactions: Transaction[]
): string => {
  const parts: string[] = [];
  
  parts.push(`📋 **GUIA COMPLETO DE ORÇAMENTO**\n`);
  
  parts.push(`**SITUAÇÃO ATUAL:**`);
  parts.push(`- Receitas: R$ ${context.userProfile.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  parts.push(`- Despesas: R$ ${context.userProfile.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
  parts.push(`- Orçamentos criados: ${budgets.length}\n`);
  
  parts.push(`**REGRA 50/30/20 RECOMENDADA:**`);
  parts.push(`- 50% (R$ ${(context.userProfile.totalIncome * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) → Necessidades`);
  parts.push(`- 30% (R$ ${(context.userProfile.totalIncome * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) → Desejos`);
  parts.push(`- 20% (R$ ${(context.userProfile.totalIncome * 0.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) → Poupança/Investimentos\n`);
  
  if (budgets.length === 0) {
    parts.push(`**PASSO A PASSO PARA CRIAR SEU ORÇAMENTO:**`);
    parts.push(`1. Liste todas as receitas mensais`);
    parts.push(`2. Categorize suas despesas (use as categorias do sistema)`);
    parts.push(`3. Estabeleça limites baseados na regra 50/30/20`);
    parts.push(`4. Revise gastos dos últimos 3 meses para valores realistas`);
    parts.push(`5. Crie orçamentos no sistema para acompanhar`);
    parts.push(`6. Revise e ajuste mensalmente\n`);
  } else {
    parts.push(`**SEUS ORÇAMENTOS:**`);
    budgets.forEach(budget => {
      const currentMonth = new Date().getMonth();
      const spent = transactions
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && t.category === budget.category &&
                 date.getMonth() === currentMonth;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = (spent / budget.limit) * 100;
      const status = percentage > 100 ? '🔴 Ultrapassado' : percentage > 80 ? '🟡 Atenção' : '🟢 OK';
      
      parts.push(`- ${budget.category}: ${status}`);
      parts.push(`  Limite: R$ ${budget.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      parts.push(`  Gasto: R$ ${spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage.toFixed(1)}%)`);
      parts.push(``);
    });
  }
  
  return parts.join('\n');
};

/**
 * Gera estratégia de dívidas
 */
const generateDebtStrategy = (context: ConversationContext): string => {
  const parts: string[] = [];
  
  parts.push(`💳 **ESTRATÉGIA DE GESTÃO DE DÍVIDAS**\n`);
  
  if (context.userProfile.balance < 0) {
    const debt = Math.abs(context.userProfile.balance);
    parts.push(`⚠️ **SITUAÇÃO CRÍTICA DETECTADA**`);
    parts.push(`Você está gastando R$ ${debt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a mais do que ganha por mês.\n`);
    
    parts.push(`**PLANO DE RECUPERAÇÃO EM 4 ETAPAS:**\n`);
    parts.push(`**ETAPA 1: Pare de criar novas dívidas**`);
    parts.push(`- Use apenas dinheiro ou débito`);
    parts.push(`- Cancele cartões de crédito se necessário`);
    parts.push(`- Evite novos empréstimos\n`);
    
    parts.push(`**ETAPA 2: Reduza despesas imediatamente**`);
    parts.push(`- Corte gastos não essenciais`);
    parts.push(`- Negocie contas e serviços`);
    parts.push(`- Meta: Reduzir R$ ${(debt * 0.6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês\n`);
    
    parts.push(`**ETAPA 3: Aumente receitas (se possível)**`);
    parts.push(`- Considere trabalho extra ou freelance`);
    parts.push(`- Venda itens não utilizados`);
    parts.push(`- Meta: Aumentar R$ ${(debt * 0.4).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês\n`);
    
    parts.push(`**ETAPA 4: Negocie dívidas existentes**`);
    parts.push(`- Contate credores para renegociação`);
    parts.push(`- Considere consolidar dívidas`);
    parts.push(`- Priorize dívidas com maior taxa de juros`);
  } else {
    parts.push(`✅ **Situação estável** - Você não está criando novas dívidas.`);
    parts.push(`Mantenha o controle e evite usar crédito rotativo.`);
  }
  
  return parts.join('\n');
};

/**
 * Gera planejamento para aposentadoria
 */
const generateRetirementPlanning = (context: ConversationContext): string => {
  const parts: string[] = [];
  const age = 35; // Assumindo idade média
  const retirementAge = 65;
  const yearsToRetirement = retirementAge - age;
  const monthlySavings = context.userProfile.balance;
  
  parts.push(`🏖️ **PLANEJAMENTO PARA APOSENTADORIA**\n`);
  parts.push(`**CENÁRIO ATUAL:**`);
  parts.push(`- Tempo até aposentadoria: ~${yearsToRetirement} anos`);
  parts.push(`- Poupança mensal atual: R$ ${monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  
  // Projeção simples
  const annualReturn = 0.12; // 12% ao ano
  const monthlyReturn = annualReturn / 12;
  const months = yearsToRetirement * 12;
  
  // Fórmula de valor futuro de anuidade
  const futureValue = monthlySavings * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn));
  
  parts.push(`\n**PROJEÇÃO (assumindo 12% ao ano):**`);
  parts.push(`- Valor acumulado: R$ ${futureValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`- Retirada mensal (regra dos 4%): R$ ${(futureValue * 0.04 / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  
  parts.push(`\n**RECOMENDAÇÕES:**`);
  parts.push(`1. Aumente contribuição mensal para R$ ${(monthlySavings * 1.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`2. Invista em previdência privada (PGBL/VGBL)`);
  parts.push(`3. Diversifique entre renda fixa e variável`);
  parts.push(`4. Revise objetivos anualmente`);
  
  return parts.join('\n');
};

/**
 * Gera conselho sobre fundo de emergência
 */
const generateEmergencyFundAdvice = (
  context: ConversationContext,
  _transactions: Transaction[]
): string => {
  const parts: string[] = [];
  const monthlyExpenses = context.userProfile.totalExpenses;
  const recommendedEmergency = monthlyExpenses * 6;
  const currentSavings = Math.max(0, context.userProfile.balance * 12); // Estimativa anual
  
  parts.push(`🛡️ **FUNDO DE EMERGÊNCIA**\n`);
  parts.push(`**RECOMENDAÇÃO:**`);
  parts.push(`- Despesas mensais: R$ ${monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`- Fundo recomendado (6 meses): R$ ${recommendedEmergency.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  parts.push(`- Fundo atual estimado: R$ ${currentSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  
  const gap = recommendedEmergency - currentSavings;
  if (gap > 0) {
    parts.push(`- Gap: R$ ${gap.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
    parts.push(`**PLANO PARA ALCANÇAR:**`);
    const monthlyGoal = gap / 12; // Em 12 meses
    parts.push(`- Economize R$ ${monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    parts.push(`- Ou R$ ${(monthlyGoal / 4).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/semana`);
    parts.push(`- Onde investir: Tesouro Selic ou CDB com liquidez diária`);
  } else {
    parts.push(`\n✅ Você já tem fundo de emergência adequado!`);
  }
  
  return parts.join('\n');
};

/**
 * Gera planejamento de metas
 */
const generateGoalPlanning = (
  context: ConversationContext,
  entities: Record<string, any>
): string => {
  const parts: string[] = [];
  const targetAmount = entities.money ? entities.money[0] : null;
  
  parts.push(`🎯 **PLANEJAMENTO DE METAS FINANCEIRAS**\n`);
  
  if (targetAmount) {
    const monthlySavings = context.userProfile.balance;
    const monthsNeeded = monthlySavings > 0 ? targetAmount / monthlySavings : Infinity;
    
    parts.push(`**META:** R$ ${targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    parts.push(`**POUPANÇA ATUAL:** R$ ${monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
    
    if (monthsNeeded < Infinity && monthsNeeded < 120) {
      parts.push(`**TEMPO ESTIMADO:** ${Math.ceil(monthsNeeded)} meses (${(monthsNeeded / 12).toFixed(1)} anos)\n`);
      
      parts.push(`**PARA ACELERAR:**`);
      const fasterMonths = monthsNeeded * 0.7;
      const neededSavings = targetAmount / fasterMonths;
      parts.push(`- Aumente poupança para R$ ${neededSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`);
      parts.push(`- Tempo reduzido para: ${Math.ceil(fasterMonths)} meses`);
    } else {
      parts.push(`\n⚠️ Poupança atual insuficiente. Considere:`);
      parts.push(`- Aumentar renda`);
      parts.push(`- Reduzir despesas`);
      parts.push(`- Ajustar meta ou prazo`);
    }
  } else {
    parts.push(`**COMO DEFINIR METAS:**`);
    parts.push(`1. Seja específico (ex: "R$ 50.000 para casa")`);
    parts.push(`2. Defina prazo realista`);
    parts.push(`3. Calcule quanto precisa economizar por mês`);
    parts.push(`4. Acompanhe progresso mensalmente`);
    parts.push(`5. Ajuste conforme necessário`);
  }
  
  return parts.join('\n');
};

/**
 * Gera comparação entre opções
 */
const generateComparison = (
  _context: ConversationContext,
  _entities: Record<string, any>
): string => {
  return `📊 **COMPARAÇÃO DE OPÇÕES**\n\nPara uma comparação detalhada, preciso saber quais opções você quer comparar.\n\nExemplos:\n- "Comparar Tesouro Selic vs CDB"\n- "Qual melhor: ações ou fundos?"\n- "Investir em imóveis ou ações?"`;
};

/**
 * Gera resposta geral inteligente
 */
const generateGeneralResponse = (
  _context: ConversationContext,
  _intent: IntentAnalysis
): string => {
  const parts: string[] = [];
  
  parts.push(`Olá! Sou seu consultor financeiro especializado com IA avançada.`);
  parts.push(`Tenho acesso a análises profundas dos seus dados financeiros.\n`);
  
  parts.push(`**POSSO AJUDAR COM:**`);
  parts.push(`💰 Estratégias avançadas de economia`);
  parts.push(`📈 Planejamento de investimentos personalizado`);
  parts.push(`📉 Análise detalhada de gastos`);
  parts.push(`📋 Criação e otimização de orçamentos`);
  parts.push(`💳 Gestão de dívidas`);
  parts.push(`🏖️ Planejamento para aposentadoria`);
  parts.push(`🎯 Definição e alcance de metas`);
  parts.push(`🛡️ Fundo de emergência`);
  parts.push(`📊 Análise financeira completa\n`);
  
  parts.push(`**EXEMPLOS DE PERGUNTAS:**`);
  parts.push(`- "Analise minha situação financeira completa"`);
  parts.push(`- "Como posso economizar R$ 500 por mês?"`);
  parts.push(`- "Onde investir R$ 10.000?"`);
  parts.push(`- "Meus gastos estão altos?"`);
  parts.push(`- "Crie um plano de orçamento para mim"`);
  parts.push(`- "Quanto preciso para me aposentar?"`);
  
  return parts.join('\n');
};

/**
 * Gera perguntas de follow-up inteligentes
 */
const generateFollowUpQuestions = (
  intent: IntentAnalysis,
  _context: ConversationContext
): string[] => {
  const questions: string[] = [];
  
  switch (intent.intent) {
    case 'economia':
      questions.push('Quer que eu detalhe estratégias específicas para suas principais categorias de gastos?');
      questions.push('Posso criar um plano mensal de economia personalizado?');
      break;
    case 'investimentos':
      questions.push('Quer uma análise mais detalhada sobre diversificação de carteira?');
      questions.push('Posso calcular projeções de retorno para diferentes estratégias?');
      break;
    case 'análise':
      questions.push('Quer que eu detalhe alguma área específica da análise?');
      questions.push('Posso criar um plano de ação prioritário?');
      break;
    default:
      questions.push('Quer uma análise completa da sua situação financeira?');
      questions.push('Posso ajudar com algum objetivo financeiro específico?');
  }
  
  return questions;
};


/**
 * Calcula o valor futuro de um investimento com aportes mensais
 * Usa a fórmula de valor futuro de uma anuidade com juros compostos
 * 
 * FV = PMT * (((1 + r)^n - 1) / r) + PV * (1 + r)^n
 * 
 * Onde:
 * FV = Valor Futuro
 * PMT = Pagamento mensal (aporte)
 * r = Taxa de juros mensal (taxa anual / 12)
 * n = Número de períodos (meses)
 * PV = Valor Presente (investimento inicial)
 */
export interface InvestmentProjection {
  year: number;
  months: number;
  totalInvested: number;
  totalValue: number;
  earnings: number;
  returnRate: number;
}

export interface InvestmentCalculation {
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  projections: InvestmentProjection[];
}

export const calculateInvestmentProjection = (
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number,
  years: number[]
): InvestmentProjection[] => {
  const monthlyRate = annualRate / 12;
  
  return years.map(year => {
    const months = year * 12;
    
    // Valor futuro dos aportes mensais (anuidade)
    const futureValueOfAnnuity = monthlyContribution > 0
      ? monthlyContribution * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))
      : 0;
    
    // Valor futuro do investimento inicial
    const futureValueOfInitial = initialAmount > 0
      ? initialAmount * Math.pow(1 + monthlyRate, months)
      : 0;
    
    // Valor total no final do período
    const totalValue = futureValueOfAnnuity + futureValueOfInitial;
    
    // Total investido (inicial + aportes mensais)
    const totalInvested = initialAmount + (monthlyContribution * months);
    
    // Ganhos (valor total - total investido)
    const earnings = totalValue - totalInvested;
    
    // Taxa de retorno percentual
    const returnRate = totalInvested > 0 ? ((earnings / totalInvested) * 100) : 0;
    
    return {
      year,
      months,
      totalInvested,
      totalValue,
      earnings,
      returnRate,
    };
  });
};

/**
 * Gera dados para gráfico de crescimento ao longo do tempo
 */
export const generateChartData = (
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number,
  maxYears: number
): Array<{ year: number; invested: number; value: number; earnings: number }> => {
  const monthlyRate = annualRate / 12;
  const data: Array<{ year: number; invested: number; value: number; earnings: number }> = [];
  
  for (let year = 0; year <= maxYears; year++) {
    const months = year * 12;
    
    const futureValueOfAnnuity = monthlyContribution > 0
      ? monthlyContribution * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))
      : 0;
    
    const futureValueOfInitial = initialAmount > 0
      ? initialAmount * Math.pow(1 + monthlyRate, months)
      : 0;
    
    const totalValue = futureValueOfAnnuity + futureValueOfInitial;
    const totalInvested = initialAmount + (monthlyContribution * months);
    const earnings = totalValue - totalInvested;
    
    data.push({
      year,
      invested: totalInvested,
      value: totalValue,
      earnings,
    });
  }
  
  return data;
};


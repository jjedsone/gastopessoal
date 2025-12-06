import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/format';
import { 
  TrendingUp, TrendingDown, AlertCircle, Repeat, Calendar, 
  DollarSign, ArrowUpCircle, ArrowDownCircle 
} from 'lucide-react';
import './PatternAnalysis.css';

interface RecurringExpense {
  description: string;
  category: string;
  averageAmount: number;
  frequency: number;
  lastOccurrence: string;
  occurrences: number;
}

interface SeasonalPattern {
  month: string;
  averageIncome: number;
  averageExpenses: number;
  trend: 'up' | 'down' | 'stable';
}

const PatternAnalysis: React.FC = () => {
  const { transactions } = useFinance();

  // Detectar gastos recorrentes
  const recurringExpenses = useMemo(() => {
    const expenseMap: Record<string, { amounts: number[]; dates: string[]; category: string }> = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const key = t.description.toLowerCase().trim() || t.category;
        if (!expenseMap[key]) {
          expenseMap[key] = { amounts: [], dates: [], category: t.category };
        }
        expenseMap[key].amounts.push(t.amount);
        expenseMap[key].dates.push(t.date);
      });

    const recurring: RecurringExpense[] = [];

    Object.entries(expenseMap).forEach(([description, data]) => {
      if (data.amounts.length >= 3) {
        const sortedDates = data.dates.sort();
        const intervals: number[] = [];
        
        for (let i = 1; i < sortedDates.length; i++) {
          const diff = new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime();
          intervals.push(diff / (1000 * 60 * 60 * 24)); // dias
        }

        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const avgAmount = data.amounts.reduce((sum, val) => sum + val, 0) / data.amounts.length;

        recurring.push({
          description: description.charAt(0).toUpperCase() + description.slice(1),
          category: data.category,
          averageAmount: avgAmount,
          frequency: Math.round(avgInterval),
          lastOccurrence: sortedDates[sortedDates.length - 1],
          occurrences: data.amounts.length,
        });
      }
    });

    return recurring
      .sort((a, b) => b.averageAmount - a.averageAmount)
      .slice(0, 10);
  }, [transactions]);

  // Padrões sazonais
  const seasonalPatterns = useMemo(() => {
    const monthData: Record<number, { income: number[]; expenses: number[] }> = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.getMonth();
      
      if (!monthData[month]) {
        monthData[month] = { income: [], expenses: [] };
      }

      if (t.type === 'income') {
        monthData[month].income.push(t.amount);
      } else {
        monthData[month].expenses.push(t.amount);
      }
    });

    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const patterns: SeasonalPattern[] = [];

    Object.entries(monthData).forEach(([month, data]) => {
      const avgIncome = data.income.length > 0
        ? data.income.reduce((sum, val) => sum + val, 0) / data.income.length
        : 0;
      const avgExpenses = data.expenses.length > 0
        ? data.expenses.reduce((sum, val) => sum + val, 0) / data.expenses.length
        : 0;

      // Determinar tendência comparando com meses anteriores
      const monthNum = parseInt(month);
      const prevMonth = monthNum === 0 ? 11 : monthNum - 1;
      const prevData = monthData[prevMonth];
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (prevData) {
        const prevAvgExpenses = prevData.expenses.length > 0
          ? prevData.expenses.reduce((sum, val) => sum + val, 0) / prevData.expenses.length
          : 0;
        
        if (avgExpenses > prevAvgExpenses * 1.1) trend = 'up';
        else if (avgExpenses < prevAvgExpenses * 0.9) trend = 'down';
      }

      patterns.push({
        month: months[monthNum],
        averageIncome: avgIncome,
        averageExpenses: avgExpenses,
        trend,
      });
    });

    return patterns.sort((a, b) => {
      const monthOrder = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  }, [transactions]);

  // Detectar mudanças de padrão
  const patternChanges = useMemo(() => {
    const alerts: Array<{ type: 'increase' | 'decrease' | 'new'; message: string; severity: 'high' | 'medium' }> = [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === lastMonth && 
               date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (lastMonthExpenses > 0) {
      const changePercent = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
      
      if (changePercent > 20) {
        alerts.push({
          type: 'increase',
          message: `Atenção: Seus gastos aumentaram ${changePercent.toFixed(1)}% em relação ao mês anterior`,
          severity: changePercent > 50 ? 'high' : 'medium',
        });
      } else if (changePercent < -20) {
        alerts.push({
          type: 'decrease',
          message: `Ótimo! Seus gastos diminuíram ${Math.abs(changePercent).toFixed(1)}% em relação ao mês anterior`,
          severity: 'medium',
        });
      }
    }

    return alerts;
  }, [transactions]);

  // Sugestões baseadas em histórico
  const suggestions = useMemo(() => {
    const suggestions: string[] = [];

    if (recurringExpenses.length > 0) {
      const topRecurring = recurringExpenses[0];
      suggestions.push(
        `Você tem um gasto recorrente de ${formatCurrency(topRecurring.averageAmount)} com "${topRecurring.description}". Considere negociar ou buscar alternativas.`
      );
    }

    const avgMonthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, new Set(transactions.map(t => {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })).size);

    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];

    if (topCategory && topCategory[1] > avgMonthlyExpenses * 0.4) {
      suggestions.push(
        `A categoria "${topCategory[0]}" representa mais de 40% dos seus gastos. Considere revisar essa área.`
      );
    }

    return suggestions;
  }, [transactions, recurringExpenses]);

  return (
    <div className="pattern-analysis">
      <div className="analysis-header">
        <div>
          <h2>
            <Repeat size={28} />
            Análise de Padrões
          </h2>
          <p>Detecção inteligente de padrões nos seus gastos</p>
        </div>
      </div>

      {/* Alertas de Mudanças */}
      {patternChanges.length > 0 && (
        <div className="alerts-section">
          <h3>
            <AlertCircle size={20} />
            Alertas de Mudanças
          </h3>
          <div className="alerts-list">
            {patternChanges.map((alert, index) => (
              <div 
                key={index} 
                className={`alert-card ${alert.severity} ${alert.type}`}
              >
                <AlertCircle size={24} />
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gastos Recorrentes */}
      <div className="analysis-section">
        <div className="section-header">
          <Repeat size={20} />
          <h3>Gastos Recorrentes Detectados</h3>
        </div>
        {recurringExpenses.length > 0 ? (
          <div className="recurring-list">
            {recurringExpenses.map((expense, index) => (
              <div key={index} className="recurring-card">
                <div className="recurring-icon">
                  <Repeat size={24} />
                </div>
                <div className="recurring-content">
                  <h4>{expense.description}</h4>
                  <div className="recurring-details">
                    <span className="category-badge">{expense.category}</span>
                    <span className="frequency">
                      A cada {expense.frequency} dias (média)
                    </span>
                  </div>
                  <div className="recurring-stats">
                    <div className="stat-item">
                      <DollarSign size={16} />
                      <span>Média: {formatCurrency(expense.averageAmount)}</span>
                    </div>
                    <div className="stat-item">
                      <Calendar size={16} />
                      <span>Última: {formatDate(expense.lastOccurrence)}</span>
                    </div>
                    <div className="stat-item">
                      <Repeat size={16} />
                      <span>{expense.occurrences} ocorrências</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Nenhum padrão recorrente detectado ainda</p>
            <span className="hint">Adicione mais transações para detectar padrões</span>
          </div>
        )}
      </div>

      {/* Padrões Sazonais */}
      <div className="analysis-section">
        <div className="section-header">
          <Calendar size={20} />
          <h3>Padrões Sazonais</h3>
        </div>
        {seasonalPatterns.length > 0 ? (
          <div className="seasonal-grid">
            {seasonalPatterns.map((pattern, index) => (
              <div key={index} className="seasonal-card">
                <div className="seasonal-header">
                  <h4>{pattern.month}</h4>
                  {pattern.trend === 'up' && (
                    <TrendingUp size={20} color="var(--danger)" />
                  )}
                  {pattern.trend === 'down' && (
                    <TrendingDown size={20} color="var(--success)" />
                  )}
                  {pattern.trend === 'stable' && (
                    <div className="stable-indicator" />
                  )}
                </div>
                <div className="seasonal-stats">
                  <div className="stat-row">
                    <ArrowUpCircle size={16} color="var(--success)" />
                    <span>Receitas: {formatCurrency(pattern.averageIncome)}</span>
                  </div>
                  <div className="stat-row">
                    <ArrowDownCircle size={16} color="var(--danger)" />
                    <span>Gastos: {formatCurrency(pattern.averageExpenses)}</span>
                  </div>
                  <div className="stat-row net">
                    <span>Saldo: {formatCurrency(pattern.averageIncome - pattern.averageExpenses)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Dados insuficientes para análise sazonal</p>
          </div>
        )}
      </div>

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <div className="analysis-section">
          <div className="section-header">
            <AlertCircle size={20} />
            <h3>Sugestões Baseadas em Histórico</h3>
          </div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-card">
                <AlertCircle size={20} color="var(--primary)" />
                <p>{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternAnalysis;


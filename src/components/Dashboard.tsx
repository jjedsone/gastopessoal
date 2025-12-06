import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { transactions, user } = useFinance();
  const [periodFilter, setPeriodFilter] = useState<'month' | 'week' | 'year'>('month');
  
  // Calcular resumo baseado no período selecionado
  const summary = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (periodFilter) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savings = Math.max(0, balance);
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    return { totalIncome, totalExpenses, balance, savings, savingsRate };
  }, [transactions, periodFilter]);

  // Dados para gráfico de linha (últimos 7 dias)
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => t.date === dateStr);
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receitas: income,
        despesas: expenses,
      };
    });
  }, [transactions]);

  // Dados para gráfico de pizza (categorias de despesas)
  const pieData = useMemo(() => {
    const categoryData: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  // Estatísticas adicionais
  const additionalStats = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    const avgExpense = expenseTransactions.length > 0
      ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length
      : 0;
    
    const avgIncome = incomeTransactions.length > 0
      ? incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length
      : 0;
    
    const largestExpense = expenseTransactions.length > 0
      ? expenseTransactions.reduce((max, t) => t.amount > max.amount ? t : max, expenseTransactions[0])
      : null;
    
    const totalTransactions = transactions.length;
    
    return { avgExpense, avgIncome, largestExpense, totalTransactions };
  }, [transactions]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Bem-vindo, {user?.name}!</h2>
          {user?.type === 'couple' && <p className="subtitle">Gestão financeira compartilhada</p>}
        </div>
        <div className="period-filter">
          <Calendar size={18} />
          <select 
            value={periodFilter} 
            onChange={(e) => setPeriodFilter(e.target.value as 'month' | 'week' | 'year')}
            className="period-select"
          >
            <option value="week">Última Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Último Ano</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Receitas</p>
            <p className="stat-value">{formatCurrency(summary.totalIncome)}</p>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Despesas</p>
            <p className="stat-value">{formatCurrency(summary.totalExpenses)}</p>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Saldo</p>
            <p className={`stat-value ${summary.balance < 0 ? 'negative' : ''}`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        <div className="stat-card savings">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Taxa de Poupança</p>
            <p className="stat-value">{summary.savingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Receitas vs Despesas (7 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Gastos por Categoria</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>Nenhuma despesa registrada ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas Adicionais */}
      {additionalStats.totalTransactions > 0 && (
        <div className="additional-stats">
          <h3>
            <BarChart3 size={20} />
            Estatísticas Detalhadas
          </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total de Transações</p>
              <p className="stat-value">{additionalStats.totalTransactions}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Média de Receitas</p>
              <p className="stat-value">{formatCurrency(additionalStats.avgIncome)}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Média de Despesas</p>
              <p className="stat-value">{formatCurrency(additionalStats.avgExpense)}</p>
            </div>
            {additionalStats.largestExpense && (
              <div className="stat-card">
                <p className="stat-label">Maior Despesa</p>
                <p className="stat-value">{formatCurrency(additionalStats.largestExpense.amount)}</p>
                <p className="stat-sublabel">{additionalStats.largestExpense.category}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="actions-grid">
          <a href="/transactions" className="action-card">
            <span>➕</span>
            <span>Adicionar Transação</span>
          </a>
          <a href="/budgets" className="action-card">
            <span>🎯</span>
            <span>Criar Orçamento</span>
          </a>
          <a href="/ai-assistant" className="action-card">
            <span>🤖</span>
            <span>Consultar IA</span>
          </a>
          <a href="/investments" className="action-card">
            <span>📈</span>
            <span>Ver Investimentos</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


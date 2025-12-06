import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import './AdvancedCharts.css';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const AdvancedCharts: React.FC = () => {
  const { transactions } = useFinance();
  const [period, setPeriod] = useState<'3months' | '6months' | '12months'>('6months');

  // Dados de evolução de patrimônio
  const netWorthData = useMemo(() => {
    const months: Record<string, { income: number; expenses: number; net: number }> = {};
    const now = new Date();
    const monthsToShow = period === '3months' ? 3 : period === '6months' ? 6 : 12;

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = { income: 0, expenses: 0, net: 0 };
    }

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (months[monthKey]) {
        if (t.type === 'income') {
          months[monthKey].income += t.amount;
        } else {
          months[monthKey].expenses += t.amount;
        }
        months[monthKey].net = months[monthKey].income - months[monthKey].expenses;
      }
    });

    // Calcular patrimônio acumulado
    let cumulativeNet = 0;
    return Object.entries(months).map(([month, data]) => {
      cumulativeNet += data.net;
      return {
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitas: data.income,
        despesas: data.expenses,
        patrimonio: cumulativeNet,
        saldo: data.net,
      };
    });
  }, [transactions, period]);

  // Comparação entre períodos
  const periodComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentPeriod = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const lastPeriod = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const calculateTotals = (trans: typeof transactions) => {
      const income = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return { income, expenses, balance: income - expenses };
    };

    const current = calculateTotals(currentPeriod);
    const last = calculateTotals(lastPeriod);

    return [
      {
        periodo: 'Mês Anterior',
        receitas: last.income,
        despesas: last.expenses,
        saldo: last.balance,
      },
      {
        periodo: 'Mês Atual',
        receitas: current.income,
        despesas: current.expenses,
        saldo: current.balance,
      },
    ];
  }, [transactions]);

  // Heatmap de gastos por dia da semana
  const weeklyHeatmap = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayTotals: Record<number, number> = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date);
        const dayOfWeek = date.getDay();
        dayTotals[dayOfWeek] = (dayTotals[dayOfWeek] || 0) + t.amount;
      });

    return days.map((day, index) => ({
      dia: day,
      valor: dayTotals[index] || 0,
    }));
  }, [transactions]);

  // Distribuição de gastos por categoria
  const categoryDistribution = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const sorted = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    return sorted;
  }, [transactions]);

  // Tendência de longo prazo
  const longTermTrend = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = 0;
    }

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[monthKey] !== undefined) {
        if (t.type === 'income') {
          months[monthKey] += t.amount;
        } else {
          months[monthKey] -= t.amount;
        }
      }
    });

    return Object.entries(months).map(([month, value]) => ({
      mes: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
      saldo: value,
    }));
  }, [transactions]);

  const getMaxValue = (data: typeof weeklyHeatmap) => {
    return Math.max(...data.map(d => d.valor), 1);
  };

  const maxHeatmapValue = getMaxValue(weeklyHeatmap);

  return (
    <div className="advanced-charts">
      <div className="charts-header">
        <div>
          <h2>
            <BarChart3 size={28} />
            Gráficos Avançados
          </h2>
          <p>Análise detalhada das suas finanças</p>
        </div>
        <div className="period-selector">
          <label>Período:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
            <option value="3months">3 Meses</option>
            <option value="6months">6 Meses</option>
            <option value="12months">12 Meses</option>
          </select>
        </div>
      </div>

      {/* Comparação entre Períodos */}
      <div className="chart-section">
        <div className="chart-header">
          <Calendar size={20} />
          <h3>Comparação entre Períodos</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              <Bar dataKey="saldo" fill="#6366f1" name="Saldo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolução de Patrimônio */}
      <div className="chart-section">
        <div className="chart-header">
          <TrendingUp size={20} />
          <h3>Evolução do Patrimônio</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={netWorthData}>
              <defs>
                <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="patrimonio" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorPatrimonio)"
                name="Patrimônio Acumulado"
              />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Receitas"
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap de Gastos por Dia da Semana */}
      <div className="chart-section">
        <div className="chart-header">
          <Calendar size={20} />
          <h3>Gastos por Dia da Semana</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="valor" name="Gastos">
                {weeklyHeatmap.map((entry, index) => {
                  const intensity = maxHeatmapValue > 0 ? entry.valor / maxHeatmapValue : 0;
                  const colorIndex = Math.floor(intensity * (COLORS.length - 1));
                  return <Cell key={`cell-${index}`} fill={COLORS[colorIndex]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuição por Categoria */}
      <div className="chart-section">
        <div className="chart-header">
          <DollarSign size={20} />
          <h3>Distribuição de Gastos por Categoria</h3>
        </div>
        <div className="chart-container pie-chart">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendência de Longo Prazo */}
      <div className="chart-section">
        <div className="chart-header">
          <TrendingUp size={20} />
          <h3>Tendência de Longo Prazo (12 Meses)</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={longTermTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 8 }}
                name="Saldo Mensal"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;


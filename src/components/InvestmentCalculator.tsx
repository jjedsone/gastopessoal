import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Target, BarChart3, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { calculateInvestmentProjection, generateChartData } from '../utils/investmentCalculator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './InvestmentCalculator.css';

interface InvestmentCalculatorProps {
  onClose?: () => void;
  initialData?: {
    initialAmount?: number;
    monthlyContribution?: number;
    rate?: number;
  };
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ onClose, initialData }) => {
  const [formData, setFormData] = useState({
    initialAmount: initialData?.initialAmount?.toString() || '',
    monthlyContribution: initialData?.monthlyContribution?.toString() || '',
    annualRate: initialData?.rate || 0.12,
    years: 10,
  });

  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

  // Calcular projeções
  const projections = useMemo(() => {
    if (!formData.initialAmount && !formData.monthlyContribution) return [];
    
    return calculateInvestmentProjection(
      parseFloat(formData.initialAmount) || 0,
      parseFloat(formData.monthlyContribution) || 0,
      formData.annualRate,
      [1, 3, 5, 10, 15, 20]
    );
  }, [formData]);

  // Dados para gráfico
  const chartData = useMemo(() => {
    if (!formData.initialAmount && !formData.monthlyContribution) return [];
    
    return generateChartData(
      parseFloat(formData.initialAmount) || 0,
      parseFloat(formData.monthlyContribution) || 0,
      formData.annualRate,
      formData.years
    );
  }, [formData]);

  // Calcular totais
  const totals = useMemo(() => {
    if (projections.length === 0) return null;
    
    const lastProjection = projections[projections.length - 1];
    return {
      totalInvested: lastProjection.totalInvested,
      totalValue: lastProjection.totalValue,
      earnings: lastProjection.earnings,
      returnRate: lastProjection.returnRate,
    };
  }, [projections]);

  const investmentOptions = [
    { name: 'Tesouro Selic', rate: 0.12, risk: 'Baixo' },
    { name: 'CDB', rate: 0.14, risk: 'Médio' },
    { name: 'Fundos Renda Fixa', rate: 0.13, risk: 'Médio' },
    { name: 'Ações/ETFs', rate: 0.18, risk: 'Alto' },
    { name: 'Fundos Imobiliários', rate: 0.15, risk: 'Médio-Alto' },
  ];

  return (
    <div className="investment-calculator-modal">
      <div className="calculator-container animate-scale-in">
        <div className="calculator-header">
          <div className="header-content">
            <Calculator size={32} className="header-icon" />
            <div>
              <h2>Calculadora de Investimentos</h2>
              <p>Simule diferentes cenários e veja o potencial de seus investimentos</p>
            </div>
          </div>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <div className="calculator-tabs">
          <button
            className={`tab ${activeTab === 'simple' ? 'active' : ''}`}
            onClick={() => setActiveTab('simple')}
          >
            <Target size={18} />
            Simples
          </button>
          <button
            className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <BarChart3 size={18} />
            Avançado
          </button>
        </div>

        <div className="calculator-content">
          <div className="calculator-form-section">
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <DollarSign size={18} />
                  Investimento Inicial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initialAmount}
                  onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                  placeholder="0.00"
                  className="input-animated"
                />
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={18} />
                  Aporte Mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  placeholder="0.00"
                  className="input-animated"
                />
              </div>

              <div className="form-group">
                <label>
                  <TrendingUp size={18} />
                  Rentabilidade Anual (%)
                </label>
                <div className="rate-selector">
                  <select
                    value={formData.annualRate}
                    onChange={(e) => setFormData({ ...formData, annualRate: parseFloat(e.target.value) })}
                    className="select-animated"
                  >
                    {investmentOptions.map((opt) => (
                      <option key={opt.name} value={opt.rate}>
                        {opt.name} - {(opt.rate * 100).toFixed(1)}% a.a. ({opt.risk})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    value={(formData.annualRate * 100).toFixed(1)}
                    onChange={(e) => setFormData({ ...formData, annualRate: parseFloat(e.target.value) / 100 })}
                    className="rate-input"
                  />
                </div>
              </div>

              {activeTab === 'advanced' && (
                <div className="form-group">
                  <label>
                    <Calendar size={18} />
                    Período de Análise (anos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.years}
                    onChange={(e) => setFormData({ ...formData, years: parseInt(e.target.value) || 10 })}
                    className="input-animated"
                  />
                </div>
              )}
            </div>

            {/* Quick presets */}
            <div className="presets">
              <span className="presets-label">Cenários Rápidos:</span>
              <div className="preset-buttons">
                <button
                  className="preset-btn"
                  onClick={() => setFormData({
                    ...formData,
                    initialAmount: '1000',
                    monthlyContribution: '500',
                    annualRate: 0.12,
                  })}
                >
                  Conservador
                </button>
                <button
                  className="preset-btn"
                  onClick={() => setFormData({
                    ...formData,
                    initialAmount: '5000',
                    monthlyContribution: '1000',
                    annualRate: 0.15,
                  })}
                >
                  Moderado
                </button>
                <button
                  className="preset-btn"
                  onClick={() => setFormData({
                    ...formData,
                    initialAmount: '10000',
                    monthlyContribution: '2000',
                    annualRate: 0.18,
                  })}
                >
                  Agressivo
                </button>
              </div>
            </div>
          </div>

          {projections.length > 0 && (
            <>
              {/* Resultados principais */}
              <div className="results-summary">
                <div className="summary-card highlight">
                  <div className="summary-icon">
                    <Target size={24} />
                  </div>
                  <div className="summary-content">
                    <span className="summary-label">Valor Total em {formData.years} anos</span>
                    <span className="summary-value count-up">
                      {totals ? formatCurrency(totals.totalValue) : 'R$ 0,00'}
                    </span>
                  </div>
                </div>

                <div className="summary-grid">
                  <div className="summary-card">
                    <span className="summary-label">Total Investido</span>
                    <span className="summary-value">
                      {totals ? formatCurrency(totals.totalInvested) : 'R$ 0,00'}
                    </span>
                  </div>

                  <div className="summary-card earnings">
                    <span className="summary-label">Ganhos</span>
                    <span className="summary-value">
                      {totals ? formatCurrency(totals.earnings) : 'R$ 0,00'}
                    </span>
                  </div>

                  <div className="summary-card">
                    <span className="summary-label">Retorno</span>
                    <span className="summary-value return-rate">
                      {totals ? `${totals.returnRate.toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Projeções por período */}
              <div className="projections-section">
                <h3>
                  <BarChart3 size={20} />
                  Projeções por Período
                </h3>
                <div className="projections-grid">
                  {projections.map((proj, index) => (
                    <div key={proj.year} className="projection-card card-entrance" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="projection-header">
                        <span className="projection-years">{proj.year}</span>
                        <span className="projection-label">anos</span>
                      </div>
                      <div className="projection-values">
                        <div className="projection-item">
                          <span>Investido</span>
                          <span className="value">{formatCurrency(proj.totalInvested)}</span>
                        </div>
                        <div className="projection-item">
                          <span>Valor Total</span>
                          <span className="value total">{formatCurrency(proj.totalValue)}</span>
                        </div>
                        <div className="projection-item highlight">
                          <span>Ganhos</span>
                          <span className="value earnings">{formatCurrency(proj.earnings)}</span>
                        </div>
                        <div className="projection-item">
                          <span>Retorno</span>
                          <span className="value return">{proj.returnRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico */}
              {chartData.length > 0 && (
                <div className="chart-section">
                  <h3>
                    <TrendingUp size={20} />
                    Evolução do Investimento
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Anos', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `${label} anos`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="invested" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        name="Total Investido"
                        dot={{ r: 4 }}
                        animationDuration={1000}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Valor Total"
                        dot={{ r: 5 }}
                        animationDuration={1000}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Ganhos"
                        dot={{ r: 4 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Comparação de cenários */}
              {activeTab === 'advanced' && (
                <div className="scenarios-section">
                  <h3>
                    <Zap size={20} />
                    Comparação de Cenários
                  </h3>
                  <div className="scenarios-grid">
                    {[0.10, 0.12, 0.15, 0.18].map((rate) => {
                      const scenario = calculateInvestmentProjection(
                        parseFloat(formData.initialAmount) || 0,
                        parseFloat(formData.monthlyContribution) || 0,
                        rate,
                        [formData.years]
                      )[0];
                      
                      return (
                        <div key={rate} className="scenario-card">
                          <div className="scenario-header">
                            <span className="scenario-rate">{(rate * 100).toFixed(0)}%</span>
                            <span className="scenario-label">ao ano</span>
                          </div>
                          <div className="scenario-value">
                            {formatCurrency(scenario?.totalValue || 0)}
                          </div>
                          <div className="scenario-diff">
                            {scenario && totals ? (
                              <span className={scenario.totalValue > totals.totalValue ? 'positive' : 'negative'}>
                                {scenario.totalValue > totals.totalValue ? '+' : ''}
                                {formatCurrency(Math.abs(scenario.totalValue - totals.totalValue))}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;


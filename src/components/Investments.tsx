import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { TrendingUp, Shield, Zap, AlertCircle, Calculator } from 'lucide-react';
import InvestmentCalculator from './InvestmentCalculator';
import './Investments.css';

const Investments: React.FC = () => {
  const { getInvestmentSuggestions, getFinancialSummary } = useFinance();
  const suggestions = getInvestmentSuggestions();
  const summary = getFinancialSummary();
  
  // Estado da calculadora
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    initialAmount: '',
    monthlyContribution: '',
    selectedRate: 0.12, // 12% ao ano padrão
    selectedInvestment: null as typeof suggestions[0] | null,
  });

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Shield size={20} color="#10b981" />;
      case 'medium':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'high':
        return <Zap size={20} color="#ef4444" />;
      default:
        return <TrendingUp size={20} />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return 'var(--text-light)';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'Baixo Risco';
      case 'medium':
        return 'Risco Médio';
      case 'high':
        return 'Alto Risco';
      default:
        return 'N/A';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'conservative':
        return 'Conservador';
      case 'moderate':
        return 'Moderado';
      case 'aggressive':
        return 'Agressivo';
      default:
        return type;
    }
  };


  const handleOpenCalculator = (suggestion: typeof suggestions[0]) => {
    setCalculatorData({
      initialAmount: suggestion.minAmount.toString(),
      monthlyContribution: '',
      selectedRate: suggestion.expectedReturn,
      selectedInvestment: suggestion,
    });
    setShowCalculator(true);
  };

  return (
    <div className="investments">
      <div className="investments-header">
        <div>
          <h2>Sugestões de Investimentos</h2>
          <p>Recomendações baseadas no seu perfil e disponibilidade</p>
        </div>
        <div className="savings-info">
          <span className="label">Disponível para investir</span>
          <span className="value">{formatCurrency(summary.savings)}</span>
        </div>
      </div>

      {summary.savings < 100 ? (
        <div className="insufficient-funds">
          <AlertCircle size={48} color="var(--warning)" />
          <h3>Fundo insuficiente para investir</h3>
          <p>
            Você precisa de pelo menos R$ 100,00 para começar a investir.
            Continue economizando para alcançar seus objetivos!
          </p>
          <div className="savings-tip">
            <strong>Dica:</strong> Tente economizar pelo menos 20% da sua renda mensal para
            construir uma base sólida antes de investir.
          </div>
        </div>
      ) : (
        <>
          <div className="investment-info">
            <div className="info-card">
              <h3>💰 Por que investir?</h3>
              <ul>
                <li>Proteção contra inflação</li>
                <li>Crescimento do patrimônio ao longo do tempo</li>
                <li>Renda passiva para o futuro</li>
                <li>Alcance de objetivos financeiros</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>📊 Regra de Ouro</h3>
              <p>
                Antes de investir, certifique-se de ter um fundo de emergência equivalente a
                6 meses de despesas. Isso protege você de imprevistos sem precisar resgatar
                seus investimentos.
              </p>
            </div>
          </div>

          <div className="investments-grid">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="investment-card">
                <div className="investment-header">
                  <div className="investment-type">
                    <span className="type-badge">{getTypeLabel(suggestion.type)}</span>
                  </div>
                  {getRiskIcon(suggestion.riskLevel)}
                </div>

                <h3>{suggestion.name}</h3>
                <p className="investment-description">{suggestion.description}</p>

                <div className="investment-details">
                  <div className="detail-item">
                    <span className="detail-label">Rentabilidade Esperada</span>
                    <span className="detail-value positive">
                      {(suggestion.expectedReturn * 100).toFixed(1)}% ao ano
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nível de Risco</span>
                    <span
                      className="detail-value"
                      style={{ color: getRiskColor(suggestion.riskLevel) }}
                    >
                      {getRiskLabel(suggestion.riskLevel)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Investimento Mínimo</span>
                    <span className="detail-value">{formatCurrency(suggestion.minAmount)}</span>
                  </div>
                </div>

                <div className="investment-projection">
                  <strong>Projeção:</strong>
                  <p>
                    Investindo {formatCurrency(suggestion.minAmount)} hoje, em 1 ano você teria
                    aproximadamente{' '}
                    <strong>
                      {formatCurrency(
                        suggestion.minAmount * (1 + suggestion.expectedReturn)
                      )}
                    </strong>
                  </p>
                </div>

                <button 
                  className="invest-btn"
                  onClick={() => handleOpenCalculator(suggestion)}
                >
                  <Calculator size={18} />
                  Simular Investimento
                </button>
              </div>
            ))}
          </div>

          <div className="investment-warning">
            <AlertCircle size={20} />
            <p>
              <strong>Atenção:</strong> Investimentos envolvem riscos. Consulte um profissional
              financeiro antes de tomar decisões importantes. As informações aqui são apenas
              sugestões educacionais.
            </p>
          </div>
        </>
      )}

      {/* Calculadora de Investimentos */}
      {showCalculator && (
        <InvestmentCalculator
          onClose={() => setShowCalculator(false)}
          initialData={{
            initialAmount: calculatorData.selectedInvestment?.minAmount,
            monthlyContribution: parseFloat(calculatorData.monthlyContribution) || undefined,
            rate: calculatorData.selectedRate,
          }}
        />
      )}
    </div>
  );
};

export default Investments;


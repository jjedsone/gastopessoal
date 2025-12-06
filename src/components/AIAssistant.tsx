import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { Bot, Lightbulb, TrendingUp, AlertTriangle, Target, MessageSquare, Brain } from 'lucide-react';
import { generateIntelligentRecommendations, analyzeSpendingPatterns, analyzeTrends } from '../utils/financialAnalysis';
import { analyzeIntent, generateAdvancedResponse, ConversationContext } from '../utils/advancedAI';
import './AIAssistant.css';

const AIAssistant: React.FC = () => {
  const { getAIRecommendations, getFinancialSummary, transactions, budgets } = useFinance();
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const summary = getFinancialSummary();
  
  // Análises avançadas
  const advancedInsights = useMemo(() => {
    return generateIntelligentRecommendations(
      transactions,
      budgets,
      summary.totalIncome,
      summary.totalExpenses,
      summary.savingsRate
    );
  }, [transactions, budgets, summary]);

  const spendingPatterns = useMemo(() => {
    return analyzeSpendingPatterns(transactions, summary.totalIncome);
  }, [transactions, summary.totalIncome]);

  const trends = useMemo(() => {
    return analyzeTrends(transactions);
  }, [transactions]);


  // Combinar recomendações básicas com avançadas
  const allRecommendations = useMemo(() => {
    const basicRecs = getAIRecommendations();
    const advancedRecs = advancedInsights.map(insight => ({
      id: `advanced-${insight.type}-${Date.now()}`,
      type: insight.type === 'savings_opportunity' ? 'savings' : 
            insight.type === 'risk_alert' ? 'expense_reduction' : 
            insight.type === 'optimization' ? 'budget_optimization' : 'savings',
      title: insight.title,
      description: insight.description,
      priority: insight.severity === 'critical' ? 'high' : 
                insight.severity === 'high' ? 'high' : 
                insight.severity === 'medium' ? 'medium' : 'low',
      actionItems: insight.recommendations,
    }));
    
    // Combinar e remover duplicatas
    const combined = [...basicRecs, ...advancedRecs];
    const unique = combined.filter((rec, index, self) => 
      index === self.findIndex(r => r.title === rec.title)
    );
    
    return unique.sort((a, b) => {
      const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as 'high' | 'medium' | 'low'] - priorityOrder[a.priority as 'high' | 'medium' | 'low'];
    });
  }, [getAIRecommendations, advancedInsights]);

  // Contexto da conversa
  const conversationContext = useMemo<ConversationContext>(() => ({
    userProfile: {
      savingsRate: summary.savingsRate,
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      balance: summary.balance,
      riskTolerance: summary.savingsRate < 10 ? 'conservative' : 
                     summary.savingsRate > 30 ? 'aggressive' : 'moderate',
      financialGoals: [],
      timeHorizon: 'medium',
    },
    conversationHistory: chatMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(),
    })),
    identifiedNeeds: [],
    previousRecommendations: [],
  }), [summary, chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    setInputMessage('');

    // Processar com IA avançada
    setTimeout(() => {
      // Analisar intenção
      const intent = analyzeIntent(userMessage);
      
      // Gerar resposta avançada
      const aiResponse = generateAdvancedResponse(
        userMessage,
        intent,
        conversationContext,
        transactions,
        budgets,
        spendingPatterns,
        trends,
        advancedInsights
      );
      
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    }, 800); // Simular processamento mais realista
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <Target size={20} />;
      case 'investment':
        return <TrendingUp size={20} />;
      case 'expense_reduction':
        return <AlertTriangle size={20} />;
      default:
        return <Lightbulb size={20} />;
    }
  };

  const getRecommendationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      default:
        return 'var(--success)';
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div className="ai-title">
          <Bot size={32} color="var(--primary)" />
          <div>
            <h2>Assistente IA Financeiro</h2>
            <p>Seu parceiro inteligente para gestão financeira</p>
          </div>
        </div>
      </div>

      <div className="ai-content">
        <div className="recommendations-section">
          <div className="section-header">
            <h3>
              <Brain size={20} />
              Análise Inteligente e Recomendações
            </h3>
            {allRecommendations.length > 0 && (
              <span className="insights-badge">{allRecommendations.length} insights</span>
            )}
          </div>
          
          {/* Estatísticas Rápidas */}
          {transactions.length > 0 && (
            <div className="quick-stats">
              <div className="quick-stat-item">
                <span className="stat-label">Padrões Analisados</span>
                <span className="stat-value">{spendingPatterns.length}</span>
              </div>
              <div className="quick-stat-item">
                <span className="stat-label">Tendências</span>
                <span className="stat-value">{trends.length} meses</span>
              </div>
              <div className="quick-stat-item">
                <span className="stat-label">Insights Críticos</span>
                <span className="stat-value critical">
                  {advancedInsights.filter(i => i.severity === 'critical').length}
                </span>
              </div>
            </div>
          )}

          {allRecommendations.length === 0 ? (
            <div className="empty-recommendations">
              <p>Continue registrando suas transações para receber recomendações personalizadas!</p>
            </div>
          ) : (
            <div className="recommendations-list">
              {allRecommendations.map((rec) => (
                <div key={rec.id} className="recommendation-card">
                  <div className="recommendation-header">
                    <div
                      className="recommendation-icon"
                      style={{ color: getRecommendationColor(rec.priority) }}
                    >
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="recommendation-title-section">
                      <h4>{rec.title}</h4>
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getRecommendationColor(rec.priority) }}
                      >
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                  <p className="recommendation-description">{rec.description}</p>
                  
                  {/* Mostrar impacto se disponível */}
                  {advancedInsights.find(i => i.title === rec.title)?.impact && (
                    <div className="impact-estimate">
                      <strong>Impacto Estimado:</strong>{' '}
                      {formatCurrency(advancedInsights.find(i => i.title === rec.title)!.impact)}/mês
                    </div>
                  )}
                  
                  <div className="action-items">
                    <strong>Ações sugeridas:</strong>
                    <ul>
                      {rec.actionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Mostrar confiança se disponível */}
                  {advancedInsights.find(i => i.title === rec.title)?.confidence && (
                    <div className="confidence-score">
                      <span>Confiança na análise: {advancedInsights.find(i => i.title === rec.title)!.confidence}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-section">
          <h3>Chat com IA</h3>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="chat-welcome">
                  <Bot size={48} color="var(--primary)" />
                  <p><strong>Olá! Sou seu assistente financeiro inteligente.</strong></p>
                  <p>Tenho acesso a análises avançadas dos seus dados financeiros e posso oferecer recomendações personalizadas.</p>
                  <div className="suggestions">
                    <strong>Perguntas que posso responder:</strong>
                    <ul>
                      <li>"Como posso economizar mais?"</li>
                      <li>"Onde devo investir meu dinheiro?"</li>
                      <li>"Analise meus gastos e me dê dicas"</li>
                      <li>"Me ajude a criar um orçamento"</li>
                      <li>"Quais são minhas maiores oportunidades de economia?"</li>
                      <li>"Como está minha saúde financeira?"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    {msg.role === 'ai' && <Bot size={20} />}
                    <div className="message-content">
                      {msg.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < msg.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="chat-input"
              />
              <button type="submit" className="chat-send-btn">
                <MessageSquare size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;


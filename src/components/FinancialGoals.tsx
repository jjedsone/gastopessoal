import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/format';
import { Target, Plus, Edit, Trash2, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { FinancialGoal } from '../types';
import './FinancialGoals.css';

const FinancialGoals: React.FC = () => {
  const { getFinancialSummary } = useFinance();
  const { showNotification } = useNotification();
  const summary = getFinancialSummary();
  
  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('financialGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'savings' as FinancialGoal['category'],
  });

  // Salvar metas no localStorage
  React.useEffect(() => {
    localStorage.setItem('financialGoals', JSON.stringify(goals));
  }, [goals]);

  // Atualizar progresso das metas baseado no saldo
  React.useEffect(() => {
    setGoals(prevGoals => prevGoals.map(goal => {
      if (goal.category === 'savings' && !goal.isCompleted) {
        const newAmount = Math.min(goal.currentAmount + summary.savings, goal.targetAmount);
        const isCompleted = newAmount >= goal.targetAmount;
        return {
          ...goal,
          currentAmount: newAmount,
          isCompleted,
          completedAt: isCompleted && !goal.completedAt ? new Date().toISOString() : goal.completedAt,
        };
      }
      return goal;
    }));
  }, [summary.savings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? {
        ...g,
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
      } : g));
      showNotification('Meta atualizada com sucesso!', 'success');
    } else {
      const newGoal: FinancialGoal = {
        id: Date.now().toString(),
        userId: 'current-user',
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: 0,
        createdAt: new Date().toISOString(),
        isCompleted: false,
      };
      setGoals([...goals, newGoal]);
      showNotification('Meta criada com sucesso!', 'success');
    }
    
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      deadline: '',
      category: 'savings',
    });
    setEditingGoal(null);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline,
      category: goal.category,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      setGoals(goals.filter(g => g.id !== id));
      showNotification('Meta excluída com sucesso!', 'success');
    }
  };

  const handleComplete = (id: string) => {
    setGoals(goals.map(g => g.id === id ? {
      ...g,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    } : g));
    showNotification('Parabéns! Meta alcançada! 🎉', 'success');
  };

  const getProgressPercentage = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return '💰';
      case 'debt': return '💳';
      case 'investment': return '📈';
      case 'purchase': return '🛒';
      default: return '🎯';
    }
  };

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return (
    <div className="financial-goals">
      <div className="goals-header">
        <div>
          <h2>
            <Target size={28} />
            Metas Financeiras
          </h2>
          <p>Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} />
          Nova Meta
        </button>
      </div>

      {/* Estatísticas rápidas */}
      {goals.length > 0 && (
        <div className="goals-stats">
          <div className="stat-card">
            <span className="stat-label">Metas Ativas</span>
            <span className="stat-value">{activeGoals.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Metas Concluídas</span>
            <span className="stat-value success">{completedGoals.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total em Metas</span>
            <span className="stat-value">
              {formatCurrency(goals.reduce((sum, g) => sum + g.targetAmount, 0))}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Progresso Total</span>
            <span className="stat-value">
              {formatCurrency(goals.reduce((sum, g) => sum + g.currentAmount, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Metas Ativas */}
      {activeGoals.length > 0 ? (
        <div className="goals-section">
          <h3>Metas em Andamento</h3>
          <div className="goals-grid">
            {activeGoals.map((goal) => {
              const progress = getProgressPercentage(goal);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isNearDeadline = daysRemaining <= 30 && daysRemaining > 0;
              const isOverdue = daysRemaining < 0;

              return (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <div className="goal-icon">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div className="goal-title-section">
                      <h4>{goal.title}</h4>
                      <span className="goal-category">{goal.category}</span>
                    </div>
                    <div className="goal-actions">
                      <button onClick={() => handleEdit(goal)} className="icon-btn">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="icon-btn delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="goal-description">{goal.description}</p>
                  )}

                  <div className="goal-progress">
                    <div className="progress-info">
                      <span className="progress-amount">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="progress-percentage">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="goal-meta">
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>
                        {isOverdue ? (
                          <span className="overdue">Vencida há {Math.abs(daysRemaining)} dias</span>
                        ) : isNearDeadline ? (
                          <span className="near-deadline">Faltam {daysRemaining} dias</span>
                        ) : (
                          <span>Faltam {daysRemaining} dias</span>
                        )}
                      </span>
                    </div>
                    <div className="meta-item">
                      <TrendingUp size={16} />
                      <span>
                        Restam {formatCurrency(goal.targetAmount - goal.currentAmount)}
                      </span>
                    </div>
                  </div>

                  {progress >= 100 && (
                    <button 
                      className="complete-btn"
                      onClick={() => handleComplete(goal.id)}
                    >
                      <CheckCircle size={18} />
                      Marcar como Concluída
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <Target size={64} color="var(--text-light)" />
          <p>Nenhuma meta criada ainda</p>
          <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
            Criar primeira meta
          </button>
        </div>
      ) : null}

      {/* Metas Concluídas */}
      {completedGoals.length > 0 && (
        <div className="goals-section">
          <h3>Metas Concluídas</h3>
          <div className="goals-grid">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="goal-card completed">
                <div className="goal-header">
                  <div className="goal-icon completed-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="goal-title-section">
                    <h4>{goal.title}</h4>
                    <span className="goal-completed-date">
                      Concluída em {goal.completedAt ? formatDate(goal.completedAt) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="goal-completed-info">
                  <span className="completed-amount">
                    {formatCurrency(goal.targetAmount)} alcançado!
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingGoal ? 'Editar' : 'Nova'} Meta Financeira</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Título da Meta</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Economizar para viagem"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição (opcional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua meta..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="targetAmount">Valor Alvo (R$)</label>
                  <input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">Prazo</label>
                  <input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FinancialGoal['category'] })}
                  required
                >
                  <option value="savings">💰 Poupança</option>
                  <option value="debt">💳 Quitar Dívidas</option>
                  <option value="investment">📈 Investimento</option>
                  <option value="purchase">🛒 Compra</option>
                  <option value="other">🎯 Outro</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingGoal ? 'Salvar' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoals;


import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/format';
import { Calendar, Plus, Edit, Trash2, Clock, AlertCircle } from 'lucide-react';
import { ScheduledExpense } from '../types';
import './ScheduledExpenses.css';

const ScheduledExpenses: React.FC = () => {
  const { getFinancialSummary } = useFinance();
  const { showNotification } = useNotification();
  const summary = getFinancialSummary();
  
  const [expenses, setExpenses] = useState<ScheduledExpense[]>(() => {
    const saved = localStorage.getItem('scheduledExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ScheduledExpense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    scheduledDate: '',
    frequency: 'once' as ScheduledExpense['frequency'],
  });

  React.useEffect(() => {
    localStorage.setItem('scheduledExpenses', JSON.stringify(expenses));
  }, [expenses]);

  // Verificar despesas próximas
  const upcomingExpenses = expenses
    .filter(e => !e.isCompleted)
    .filter(e => {
      const expenseDate = new Date(e.scheduledDate);
      const today = new Date();
      const daysDiff = Math.ceil((expenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      setExpenses(expenses.map(ex => ex.id === editingExpense.id ? {
        ...ex,
        ...formData,
        amount: parseFloat(formData.amount),
      } : ex));
      showNotification('Despesa agendada atualizada!', 'success');
    } else {
      const newExpense: ScheduledExpense = {
        id: Date.now().toString(),
        userId: 'current-user',
        ...formData,
        amount: parseFloat(formData.amount),
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      setExpenses([...expenses, newExpense]);
      showNotification('Despesa agendada criada!', 'success');
    }
    
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      scheduledDate: '',
      frequency: 'once',
    });
    setEditingExpense(null);
  };

  const handleEdit = (expense: ScheduledExpense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      scheduledDate: expense.scheduledDate,
      frequency: expense.frequency || 'once',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa agendada?')) {
      setExpenses(expenses.filter(e => e.id !== id));
      showNotification('Despesa agendada excluída!', 'success');
    }
  };

  const handleComplete = (id: string) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, isCompleted: true } : e));
    showNotification('Despesa marcada como concluída!', 'success');
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const expenseDate = new Date(date);
    const diffTime = expenseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const categories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Outros'];

  const totalUpcoming = upcomingExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="scheduled-expenses">
      <div className="expenses-header">
        <div>
          <h2>
            <Calendar size={28} />
            Despesas Agendadas
          </h2>
          <p>Planeje e acompanhe suas despesas futuras</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} />
          Agendar Despesa
        </button>
      </div>

      {/* Alertas de despesas próximas */}
      {upcomingExpenses.length > 0 && (
        <div className="upcoming-alert">
          <AlertCircle size={24} />
          <div className="alert-content">
            <h3>Despesas Próximas (Próximos 7 dias)</h3>
            <p>
              Você tem <strong>{upcomingExpenses.length}</strong> despesa(s) agendada(s) totalizando{' '}
              <strong>{formatCurrency(totalUpcoming)}</strong>
            </p>
            {totalUpcoming > summary.balance && (
              <p className="warning-text">
                ⚠️ Atenção: O total das despesas agendadas ({formatCurrency(totalUpcoming)}) é maior que seu saldo atual ({formatCurrency(summary.balance)})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lista de despesas agendadas */}
      {expenses.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} color="var(--text-light)" />
          <p>Nenhuma despesa agendada ainda</p>
          <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
            Agendar primeira despesa
          </button>
        </div>
      ) : (
        <div className="expenses-list">
          {expenses
            .filter(e => !e.isCompleted)
            .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
            .map((expense) => {
              const daysUntil = getDaysUntil(expense.scheduledDate);
              const isOverdue = daysUntil < 0;
              const isSoon = daysUntil <= 3 && daysUntil >= 0;

              return (
                <div key={expense.id} className={`expense-card ${isOverdue ? 'overdue' : isSoon ? 'soon' : ''}`}>
                  <div className="expense-main">
                    <div className="expense-icon">
                      <Calendar size={24} color={isOverdue ? 'var(--danger)' : isSoon ? 'var(--warning)' : 'var(--primary)'} />
                    </div>
                    <div className="expense-content">
                      <div className="expense-header-info">
                        <h3>{expense.description}</h3>
                        <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                      </div>
                      <div className="expense-meta">
                        <span className="category-badge">{expense.category}</span>
                        <span className="date-info">
                          {isOverdue ? (
                            <span className="overdue-text">Vencida há {Math.abs(daysUntil)} dias</span>
                          ) : daysUntil === 0 ? (
                            <span className="today-text">Hoje!</span>
                          ) : (
                            <span>Em {daysUntil} dia(s)</span>
                          )}
                        </span>
                        {expense.frequency && expense.frequency !== 'once' && (
                          <span className="frequency-badge">
                            {expense.frequency === 'weekly' ? 'Semanal' :
                             expense.frequency === 'monthly' ? 'Mensal' :
                             expense.frequency === 'yearly' ? 'Anual' : 'Recorrente'}
                          </span>
                        )}
                      </div>
                      <div className="expense-date">
                        <Clock size={14} />
                        {formatDate(expense.scheduledDate)}
                      </div>
                    </div>
                  </div>
                  <div className="expense-actions">
                    <button onClick={() => handleComplete(expense.id)} className="complete-btn">
                      Concluir
                    </button>
                    <button onClick={() => handleEdit(expense)} className="icon-btn">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="icon-btn delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Despesas concluídas */}
      {expenses.filter(e => e.isCompleted).length > 0 && (
        <div className="completed-section">
          <h3>Despesas Concluídas</h3>
          <div className="expenses-list">
            {expenses
              .filter(e => e.isCompleted)
              .map((expense) => (
                <div key={expense.id} className="expense-card completed">
                  <div className="expense-main">
                    <div className="expense-content">
                      <h3>{expense.description}</h3>
                      <div className="expense-meta">
                        <span>{formatCurrency(expense.amount)}</span>
                        <span>{formatDate(expense.scheduledDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingExpense ? 'Editar' : 'Agendar'} Despesa</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Ex: Conta de luz, Aluguel, etc."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Valor (R$)</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Categoria</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scheduledDate">Data</label>
                  <input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">Frequência</label>
                  <select
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ScheduledExpense['frequency'] })}
                  >
                    <option value="once">Uma vez</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingExpense ? 'Salvar' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledExpenses;


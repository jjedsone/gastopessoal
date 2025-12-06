import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { Plus, Target, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Budgets.css';

const Budgets: React.FC = () => {
  const { budgets, addBudget, transactions, user } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly',
  });

  const categories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Outros'];

  const calculateSpent = (budgetCategory: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               t.category === budgetCategory &&
               date.getMonth() === currentMonth &&
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const budgetsWithSpent = budgets.map(budget => ({
    ...budget,
    spent: calculateSpent(budget.category),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBudget({
      userId: user?.id || '',
      ...formData,
      limit: parseFloat(formData.limit),
      spent: 0,
    });
    setFormData({ category: '', limit: '', period: 'monthly' });
    setShowModal(false);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  const chartData = budgetsWithSpent.map(b => ({
    name: b.category,
    limite: b.limit,
    gasto: b.spent,
  }));

  return (
    <div className="budgets">
      <div className="budgets-header">
        <h2>Orçamentos</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      {budgetsWithSpent.length === 0 ? (
        <div className="empty-state">
          <Target size={48} color="var(--text-light)" />
          <p>Nenhum orçamento criado ainda</p>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            Criar primeiro orçamento
          </button>
        </div>
      ) : (
        <>
          <div className="budgets-grid">
            {budgetsWithSpent.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = budget.spent > budget.limit;
              const remaining = budget.limit - budget.spent;

              return (
                <div key={budget.id} className="budget-card">
                  <div className="budget-header">
                    <div className="budget-icon">
                      <Target size={24} />
                    </div>
                    <div>
                      <h3>{budget.category}</h3>
                      <p className="budget-period">
                        {budget.period === 'monthly' ? 'Mensal' : 'Semanal'}
                      </p>
                    </div>
                  </div>

                  <div className="budget-amounts">
                    <div className="amount-item">
                      <span className="label">Limite</span>
                      <span className="value">{formatCurrency(budget.limit)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="label">Gasto</span>
                      <span className={`value ${isOverBudget ? 'over' : ''}`}>
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <div className="amount-item">
                      <span className="label">Restante</span>
                      <span className={`value ${remaining < 0 ? 'over' : ''}`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: getProgressColor(budget.spent, budget.limit),
                        }}
                      />
                    </div>
                    <span className="progress-text">{percentage.toFixed(1)}%</span>
                  </div>

                  {isOverBudget && (
                    <div className="budget-alert">
                      <AlertCircle size={16} />
                      <span>Orçamento ultrapassado!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {chartData.length > 0 && (
            <div className="budget-chart">
              <h3>Visão Geral dos Orçamentos</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="limite" fill="#6366f1" name="Limite" />
                  <Bar dataKey="gasto" fill="#10b981" name="Gasto" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Novo Orçamento</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="category">Categoria</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="limit">Limite</label>
                <input
                  id="limit"
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="period">Período</label>
                <select
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
                  required
                >
                  <option value="monthly">Mensal</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;


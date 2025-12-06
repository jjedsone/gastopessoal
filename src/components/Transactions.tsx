import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, Search, Filter, X, Tag } from 'lucide-react';
import './Transactions.css';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, user } = useFinance();
  const { showNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const categories = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
    expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Outros'],
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.category) {
      errors.category = 'Selecione uma categoria';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valor deve ser maior que zero';
    }
    
    if (parseFloat(formData.amount) > 10000000) {
      errors.amount = 'Valor muito alto (máximo: R$ 10.000.000)';
    }
    
    if (!formData.date) {
      errors.date = 'Selecione uma data';
    }
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (selectedDate > today) {
      errors.date = 'Data não pode ser futura';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Corrija os erros no formulário', 'error');
      return;
    }
    
    try {
      if (editingTransaction) {
        updateTransaction(editingTransaction, {
          ...formData,
          amount: parseFloat(formData.amount),
          tags: formData.tags,
        });
        showNotification('Transação atualizada com sucesso!', 'success');
      } else {
        addTransaction({
          userId: user?.id || '',
          ...formData,
          amount: parseFloat(formData.amount),
          tags: formData.tags,
        });
        showNotification('Transação adicionada com sucesso!', 'success');
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      showNotification('Erro ao salvar transação', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
    });
    setTagInput('');
    setFormErrors({});
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: typeof transactions[0]) => {
    setEditingTransaction(transaction.id);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      tags: transaction.tags || [],
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id);
      showNotification('Transação excluída com sucesso!', 'success');
    }
  };

  // Obter categorias únicas para filtro
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Obter tags únicas para filtro
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    transactions.forEach(t => {
      if (t.tags) {
        t.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [transactions]);

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  // Filtrar e ordenar transações
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Busca por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Filtro por tag
    if (filterTag !== 'all') {
      filtered = filtered.filter(t => t.tags && t.tags.includes(filterTag));
    }

    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, filterType, filterCategory, searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterTag('all');
  };

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || filterTag !== 'all' || searchTerm !== '';

  return (
    <div className="transactions">
      <div className="transactions-header">
        <h2>Transações</h2>
        <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} />
          Nova Transação
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <Filter size={16} />
            <label htmlFor="filterType">Tipo:</label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            >
              <option value="all">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterCategory">Categoria:</label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {uniqueTags.length > 0 && (
            <div className="filter-group">
              <Tag size={16} />
              <label htmlFor="filterTag">Tag:</label>
              <select
                id="filterTag"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              >
                <option value="all">Todas</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Limpar Filtros
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="filter-results">
            Mostrando {filteredAndSortedTransactions.length} de {transactions.length} transações
          </div>
        )}
      </div>

      <div className="transactions-list">
        {filteredAndSortedTransactions.length === 0 ? (
          <div className="empty-state">
            <p>
              {transactions.length === 0 
                ? 'Nenhuma transação registrada ainda'
                : 'Nenhuma transação encontrada com os filtros aplicados'}
            </p>
            {transactions.length === 0 ? (
              <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
                Adicionar primeira transação
              </button>
            ) : (
              <button className="add-btn" onClick={clearFilters}>
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                {transaction.type === 'income' ? (
                  <ArrowUpCircle size={24} color="#10b981" />
                ) : (
                  <ArrowDownCircle size={24} color="#ef4444" />
                )}
              </div>
              <div className="transaction-content">
                <div className="transaction-main">
                  <h3>{transaction.description || transaction.category}</h3>
                  <span className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
                <div className="transaction-meta">
                  <span className="category">{transaction.category}</span>
                  <span className="date">{formatDate(transaction.date)}</span>
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="transaction-tags">
                      {transaction.tags.map(tag => (
                        <span key={tag} className="tag-badge">
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="transaction-actions">
                <button onClick={() => handleEdit(transaction)} className="icon-btn">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(transaction.id)} className="icon-btn delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTransaction ? 'Editar' : 'Nova'} Transação</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    />
                    <span>Receita</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    />
                    <span>Despesa</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    setFormErrors({ ...formErrors, category: '' });
                  }}
                  required
                  className={formErrors.category ? 'error' : ''}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories[formData.type].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {formErrors.category && <span className="error-message">{formErrors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="amount">Valor</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10000000"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    setFormErrors({ ...formErrors, amount: '' });
                  }}
                  required
                  placeholder="0.00"
                  className={formErrors.amount ? 'error' : ''}
                />
                {formErrors.amount && <span className="error-message">{formErrors.amount}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da transação"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Data</label>
                <input
                  id="date"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setFormErrors({ ...formErrors, date: '' });
                  }}
                  required
                  className={formErrors.date ? 'error' : ''}
                />
                {formErrors.date && <span className="error-message">{formErrors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (opcional)</label>
                <div className="tags-input-container">
                  <div className="tags-display">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag-item">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="tag-remove">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-wrapper">
                    <input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Digite uma tag e pressione Enter"
                    />
                    <button type="button" onClick={addTag} className="add-tag-btn">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingTransaction ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;


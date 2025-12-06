import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Palette, Tag } from 'lucide-react';
import { CustomCategory } from '../types';
import './CustomCategories.css';

const CATEGORY_ICONS = ['💰', '🍔', '🚗', '🏠', '💊', '📚', '🎮', '🛍️', '✈️', '💼', '🎬', '🏋️', '🍕', '☕', '📱'];
const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#a855f7'
];

const CustomCategories: React.FC = () => {
  const { user } = useFinance();
  const { showNotification } = useNotification();
  
  const [categories, setCategories] = useState<CustomCategory[]>(() => {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#6366f1',
    parentCategoryId: '',
  });

  React.useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(categories));
  }, [categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? {
        ...c,
        ...formData,
      } : c));
      showNotification('Categoria atualizada com sucesso!', 'success');
    } else {
      const newCategory: CustomCategory = {
        id: Date.now().toString(),
        userId: user?.id || '',
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setCategories([...categories, newCategory]);
      showNotification('Categoria criada com sucesso!', 'success');
    }
    
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '💰',
      color: '#6366f1',
      parentCategoryId: '',
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: CustomCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '💰',
      color: category.color || '#6366f1',
      parentCategoryId: category.parentCategoryId || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      setCategories(categories.filter(c => c.id !== id));
      showNotification('Categoria excluída com sucesso!', 'success');
    }
  };

  return (
    <div className="custom-categories">
      <div className="categories-header">
        <div>
          <h2>
            <Tag size={28} />
            Categorias Personalizadas
          </h2>
          <p>Crie e personalize suas próprias categorias de transações</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <Tag size={64} color="var(--text-light)" />
          <p>Nenhuma categoria personalizada criada ainda</p>
          <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <div 
                  className="category-icon-display"
                  style={{ 
                    backgroundColor: category.color + '20',
                    color: category.color 
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                </div>
                <div className="category-actions">
                  <button onClick={() => handleEdit(category)} className="icon-btn">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="icon-btn delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3>{category.name}</h3>
              <div className="category-meta">
                <div className="meta-item">
                  <Palette size={14} />
                  <span style={{ color: category.color }}>{category.color}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCategory ? 'Editar' : 'Nova'} Categoria</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nome da Categoria</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Viagem, Presentes, etc."
                />
              </div>

              <div className="form-group">
                <label>Ícone</label>
                <div className="icon-selector">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Cor</label>
                <div className="color-selector">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="color-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingCategory ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCategories;


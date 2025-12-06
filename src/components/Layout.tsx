import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { 
  Home, 
  Wallet, 
  Target, 
  Bot, 
  TrendingUp, 
  User, 
  LogOut,
  Menu,
  X,
  Download,
  Tag,
  Calendar,
  BarChart3,
  Repeat
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './Layout.css';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: Wallet, label: 'Transações' },
    { path: '/budgets', icon: Target, label: 'Orçamentos' },
    { path: '/goals', icon: Target, label: 'Metas' },
    { path: '/categories', icon: Tag, label: 'Categorias' },
    { path: '/scheduled', icon: Calendar, label: 'Agendadas' },
    { path: '/charts', icon: BarChart3, label: 'Gráficos' },
    { path: '/patterns', icon: Repeat, label: 'Padrões' },
    { path: '/ai-assistant', icon: Bot, label: 'Assistente IA' },
    { path: '/investments', icon: TrendingUp, label: 'Investimentos' },
    { path: '/export', icon: Download, label: 'Exportar' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>💰 Gasto Pessoal</h2>
          <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
          <div className="user-info">
            <User size={16} />
            <span>{user?.name}</span>
            {user?.type === 'couple' && <span className="badge">Casado</span>}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="header">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <h1>{navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}</h1>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;


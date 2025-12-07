import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/authService';
import { UserType } from '../types';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useFinance();
  const { showNotification } = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('single');
  const [partnerName, setPartnerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      
      if (response && response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        showNotification('Login realizado com sucesso!', 'success');
        navigate('/');
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      showNotification(error.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name || !password) {
        showNotification('Preencha nome e senha', 'error');
        setLoading(false);
        return;
      }

      const response = await authService.register({
        name,
        username: username || undefined,
        password,
        type: userType,
        partnerId: userType === 'couple' && partnerName ? undefined : undefined,
      });

      if (response && response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        showNotification('Conta criada com sucesso!', 'success');
        navigate('/');
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      showNotification(error.message || 'Erro ao criar conta. Verifique os dados informados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💰 Gasto Pessoal</h1>
          <p>Gestão Financeira Inteligente</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Entrar
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Criar Conta
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="login-username">Nome de Usuário</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="seu_usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite sua senha"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Tipo de Conta</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="single"
                    checked={userType === 'single'}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                  />
                  <span>Solteiro(a)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="couple"
                    checked={userType === 'couple'}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                  />
                  <span>Casado(a)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Seu Nome</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Digite seu nome"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Nome de Usuário (opcional)</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="será gerado automaticamente se não informado"
              />
              <small>Se não informado, será gerado automaticamente baseado no seu nome</small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            {userType === 'couple' && (
              <div className="form-group">
                <label htmlFor="partnerName">Nome do Parceiro(a) (opcional)</label>
                <input
                  id="partnerName"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Nome do parceiro(a)"
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;


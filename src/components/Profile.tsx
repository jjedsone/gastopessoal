import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { User, Mail, Users, UserCircle } from 'lucide-react';
import './Profile.css';

const Profile: React.FC = () => {
  const { user } = useFinance();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <UserCircle size={80} color="var(--primary)" />
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p className="profile-email">
            <Mail size={16} />
            {user.email}
          </p>
          <span className={`profile-type ${user.type}`}>
            {user.type === 'couple' ? (
              <>
                <Users size={16} />
                Conta Compartilhada (Casado)
              </>
            ) : (
              <>
                <User size={16} />
                Conta Individual (Solteiro)
              </>
            )}
          </span>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Informações da Conta</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Nome</span>
              <span className="info-value">{user.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tipo de Conta</span>
              <span className="info-value">
                {user.type === 'couple' ? 'Casado - Compartilhada' : 'Solteiro - Individual'}
              </span>
            </div>
            {user.partnerId && (
              <div className="info-item">
                <span className="info-label">ID do Parceiro</span>
                <span className="info-value">{user.partnerId}</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Sobre o Sistema</h3>
          <div className="about-content">
            <p>
              O <strong>Gasto Pessoal</strong> é uma plataforma completa de gestão financeira
              pessoal desenvolvida para ajudar você a organizar suas finanças, economizar dinheiro
              e tomar decisões de investimento inteligentes.
            </p>
            <div className="features-list">
              <h4>Funcionalidades:</h4>
              <ul>
                <li>✅ Controle completo de receitas e despesas</li>
                <li>✅ Orçamentos personalizados por categoria</li>
                <li>✅ Dashboard com visualizações e gráficos</li>
                <li>✅ Assistente IA para recomendações financeiras</li>
                <li>✅ Sugestões de investimentos baseadas no seu perfil</li>
                <li>✅ Suporte para contas individuais e compartilhadas (casais)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Dicas de Uso</h3>
          <div className="tips-list">
            <div className="tip-item">
              <strong>1. Registre todas as transações</strong>
              <p>
                Mantenha um registro detalhado de todas as suas receitas e despesas para ter
                uma visão precisa da sua situação financeira.
              </p>
            </div>
            <div className="tip-item">
              <strong>2. Crie orçamentos realistas</strong>
              <p>
                Estabeleça limites de gastos por categoria baseados na sua realidade. Revise
                e ajuste conforme necessário.
              </p>
            </div>
            <div className="tip-item">
              <strong>3. Consulte o Assistente IA regularmente</strong>
              <p>
                Use o assistente IA para receber recomendações personalizadas sobre economia,
                redução de gastos e investimentos.
              </p>
            </div>
            <div className="tip-item">
              <strong>4. Monitore sua taxa de poupança</strong>
              <p>
                Procure economizar pelo menos 20% da sua renda. Use o dashboard para acompanhar
                seu progresso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


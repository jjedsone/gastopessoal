import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Budget, FinancialSummary, AIRecommendation, InvestmentSuggestion } from '../types';
import { transactionsAPI, budgetsAPI, authAPI } from '../utils/api';

interface FinanceContextType {
  user: User | null;
  transactions: Transaction[];
  budgets: Budget[];
  setUser: (user: User | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  getFinancialSummary: () => FinancialSummary;
  getAIRecommendations: () => AIRecommendation[];
  getInvestmentSuggestions: () => InvestmentSuggestion[];
  getTransactionsByUser: (userId: string) => Transaction[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Carregar dados do backend quando usuário estiver autenticado
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        if (savedUser && token) {
          const parsedUser = JSON.parse(savedUser);
          
          // Verificar se o token ainda é válido
          const verifyResult = await authAPI.verify();
          if (verifyResult.valid && parsedUser && parsedUser.id && parsedUser.name) {
            setUser(parsedUser);
            
            // Carregar transações e orçamentos do backend
            try {
              const [transactionsData, budgetsData] = await Promise.all([
                transactionsAPI.getAll(),
                budgetsAPI.getAll(),
              ]);
              setTransactions(transactionsData);
              setBudgets(budgetsData);
            } catch (error) {
              console.error('Erro ao carregar dados do backend:', error);
            }
          } else {
            // Token inválido, limpar dados
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
      }
    };

    loadUserData();
  }, []);

  // Salvar usuário no localStorage quando mudar
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await transactionsAPI.create(transaction);
      setTransactions([...transactions, newTransaction]);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await transactionsAPI.update(id, updates);
      setTransactions(transactions.map(t => t.id === id ? updatedTransaction : t));
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionsAPI.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const newBudget = await budgetsAPI.create(budget);
      setBudgets([...budgets, newBudget]);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = await budgetsAPI.update(id, updates);
      setBudgets(budgets.map(b => b.id === id ? updatedBudget : b));
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  };

  const getTransactionsByUser = (userId: string): Transaction[] => {
    return transactions.filter(t => t.userId === userId);
  };

  const getFinancialSummary = (): FinancialSummary => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savings = Math.max(0, balance);
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      balance,
      savings,
      savingsRate,
    };
  };

  const getAIRecommendations = (): AIRecommendation[] => {
    const summary = getFinancialSummary();
    const recommendations: AIRecommendation[] = [];

    // Recomendação de economia
    if (summary.savingsRate < 20) {
      recommendations.push({
        id: '1',
        type: 'savings',
        title: 'Aumente sua taxa de poupança',
        description: `Você está poupando apenas ${summary.savingsRate.toFixed(1)}% da sua renda. Recomendamos economizar pelo menos 20%.`,
        priority: 'high',
        actionItems: [
          'Revise despesas não essenciais',
          'Estabeleça uma meta de poupança mensal',
          'Automatize transferências para poupança',
        ],
      });
    }

    // Recomendação de redução de gastos
    const categoryExpenses: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });

    const topCategory = Object.entries(categoryExpenses)
      .sort(([, a], [, b]) => b - a)[0];

    if (topCategory && topCategory[1] > summary.totalIncome * 0.3) {
      recommendations.push({
        id: '2',
        type: 'expense_reduction',
        title: `Reduza gastos em ${topCategory[0]}`,
        description: `Você está gastando ${(topCategory[1] / summary.totalIncome * 100).toFixed(1)}% da sua renda em ${topCategory[0]}. Considere reduzir.`,
        priority: 'medium',
        actionItems: [
          `Revise gastos em ${topCategory[0]}`,
          'Procure alternativas mais econômicas',
          'Estabeleça um limite mensal para esta categoria',
        ],
      });
    }

    // Recomendação de investimento
    if (summary.savings > 1000) {
      recommendations.push({
        id: '3',
        type: 'investment',
        title: 'Considere investir suas economias',
        description: `Você tem R$ ${summary.savings.toFixed(2)} disponíveis. Considere investir para fazer seu dinheiro trabalhar para você.`,
        priority: 'medium',
        actionItems: [
          'Pesquise opções de investimento adequadas ao seu perfil',
          'Considere investimentos de baixo risco para começar',
          'Diversifique seus investimentos',
        ],
      });
    }

    return recommendations;
  };

  const getInvestmentSuggestions = (): InvestmentSuggestion[] => {
    const summary = getFinancialSummary();
    const suggestions: InvestmentSuggestion[] = [
      {
        id: '1',
        type: 'conservative',
        name: 'Tesouro Selic',
        description: 'Investimento de baixo risco, ideal para reserva de emergência',
        expectedReturn: 0.12,
        riskLevel: 'low',
        minAmount: 100,
      },
      {
        id: '2',
        type: 'moderate',
        name: 'CDB',
        description: 'Certificado de Depósito Bancário com boa rentabilidade',
        expectedReturn: 0.14,
        riskLevel: 'medium',
        minAmount: 1000,
      },
      {
        id: '3',
        type: 'moderate',
        name: 'Fundos de Renda Fixa',
        description: 'Diversificação com gestão profissional',
        expectedReturn: 0.13,
        riskLevel: 'medium',
        minAmount: 500,
      },
      {
        id: '4',
        type: 'aggressive',
        name: 'Ações e ETFs',
        description: 'Maior potencial de retorno, maior risco',
        expectedReturn: 0.18,
        riskLevel: 'high',
        minAmount: 100,
      },
    ];

    return suggestions.filter(s => summary.savings >= s.minAmount);
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        transactions,
        budgets,
        setUser,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        getFinancialSummary,
        getAIRecommendations,
        getInvestmentSuggestions,
        getTransactionsByUser,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};


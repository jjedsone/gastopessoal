import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Budget, FinancialSummary, AIRecommendation, InvestmentSuggestion } from '../types';
import { transactionsService, budgetsService } from '../services/firestoreService';
import { authService } from '../services/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

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

  // Carregar dados do Firestore quando usuário estiver autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados do usuário no Firestore
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            
            // Carregar transações e orçamentos do Firestore
            try {
              console.log('🔄 Carregando dados do Firestore para usuário:', userData.id);
              const [transactionsData, budgetsData] = await Promise.all([
                transactionsService.getAll(userData.id),
                budgetsService.getAll(userData.id),
              ]);
              
              console.log('✅ Transações carregadas:', transactionsData?.length || 0);
              console.log('✅ Orçamentos carregados:', budgetsData?.length || 0);
              
              if (Array.isArray(transactionsData)) {
                setTransactions(transactionsData);
              } else {
                console.warn('⚠️ Transações não é um array:', transactionsData);
                setTransactions([]);
              }
              if (Array.isArray(budgetsData)) {
                setBudgets(budgetsData);
              } else {
                console.warn('⚠️ Orçamentos não é um array:', budgetsData);
                setBudgets([]);
              }
            } catch (error: any) {
              console.error('❌ Erro ao carregar dados do Firestore:', error);
              console.error('Detalhes do erro:', {
                code: error.code,
                message: error.message,
                stack: error.stack
              });
              // Continuar mesmo se não conseguir carregar dados
              setTransactions([]);
              setBudgets([]);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          setUser(null);
        }
      } else {
        // Usuário não autenticado
        setUser(null);
        setTransactions([]);
        setBudgets([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Salvar usuário no localStorage quando mudar (para compatibilidade)
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
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      console.log('💾 Salvando transação no Firestore:', transaction);
      const newTransaction = await transactionsService.create({
        ...transaction,
        userId: user.id,
      });
      console.log('✅ Transação salva com sucesso:', newTransaction.id);
      setTransactions([...transactions, newTransaction]);
    } catch (error: any) {
      console.error('❌ Erro ao criar transação:', error);
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await transactionsService.update(id, updates);
      setTransactions(transactions.map(t => t.id === id ? updatedTransaction : t));
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionsService.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const newBudget = await budgetsService.create({
        ...budget,
        userId: user.id,
      });
      setBudgets([...budgets, newBudget]);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = await budgetsService.update(id, updates);
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


export type UserType = 'single' | 'couple';

export interface User {
  id: string;
  name: string;
  username: string;
  type: UserType;
  partnerId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  tags?: string[];
  customCategoryId?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
}

export interface AIRecommendation {
  id: string;
  type: 'savings' | 'investment' | 'expense_reduction' | 'budget_optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface InvestmentSuggestion {
  id: string;
  type: 'conservative' | 'moderate' | 'aggressive';
  name: string;
  description: string;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  minAmount: number;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'savings' | 'debt' | 'investment' | 'purchase' | 'other';
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

export interface CustomCategory {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  parentCategoryId?: string;
  createdAt: string;
}

export interface ScheduledExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  scheduledDate: string;
  frequency?: 'once' | 'weekly' | 'monthly' | 'yearly';
  isCompleted: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'bill' | 'budget' | 'goal' | 'review' | 'custom';
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
}

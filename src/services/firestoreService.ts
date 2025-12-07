import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Transaction, Budget, FinancialGoal, CustomCategory, ScheduledExpense, User } from '../types';

// Helper para converter Timestamp do Firestore para string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper para converter string para Timestamp do Firestore
const stringToTimestamp = (dateString: string): Timestamp => {
  return Timestamp.fromDate(new Date(dateString));
};

// Helper para remover campos undefined antes de salvar no Firestore
const removeUndefinedFields = (obj: any): any => {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

// ============ USUÁRIOS ============
export const usersService = {
  // Criar usuário
  create: async (userId: string, userData: Omit<User, 'id'>): Promise<User> => {
    const userRef = doc(db, 'users', userId);
    // Remover campos undefined antes de salvar
    const cleanedData = removeUndefinedFields({
      ...userData,
      createdAt: serverTimestamp(),
    });
    await setDoc(userRef, cleanedData);
    return { id: userId, ...userData };
  },

  // Obter usuário por ID
  getById: async (userId: string): Promise<User | null> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return { id: userSnap.id, ...userSnap.data() } as User;
  },

  // Obter usuário por username
  getByUsername: async (username: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  },

  // Atualizar usuário
  update: async (userId: string, updates: Partial<User>): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, removeUndefinedFields(updates));
  },
};

// ============ TRANSAÇÕES ============
export const transactionsService = {
  // Obter todas as transações do usuário
  getAll: async (userId: string): Promise<Transaction[]> => {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: timestampToString(doc.data().date),
      createdAt: timestampToString(doc.data().createdAt),
    })) as Transaction[];
  },

  // Criar transação
  create: async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const docRef = await addDoc(collection(db, 'transactions'), removeUndefinedFields({
      ...transaction,
      date: stringToTimestamp(transaction.date),
      createdAt: serverTimestamp(),
    }));
    
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
      date: timestampToString(docSnap.data()?.date),
      createdAt: timestampToString(docSnap.data()?.createdAt),
    } as Transaction;
  },

  // Atualizar transação
  update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const transactionRef = doc(db, 'transactions', id);
    
    const updateData: any = { ...updates };
    if (updates.date) {
      updateData.date = stringToTimestamp(updates.date);
    }
    
    await updateDoc(transactionRef, removeUndefinedFields(updateData));
    
    const docSnap = await getDoc(transactionRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
      date: timestampToString(docSnap.data()?.date),
      createdAt: timestampToString(docSnap.data()?.createdAt),
    } as Transaction;
  },

  // Deletar transação
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'transactions', id));
  },
};

// ============ ORÇAMENTOS ============
export const budgetsService = {
  // Obter todos os orçamentos do usuário
  getAll: async (userId: string): Promise<Budget[]> => {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Budget[];
  },

  // Criar orçamento
  create: async (budget: Omit<Budget, 'id'>): Promise<Budget> => {
    const docRef = await addDoc(collection(db, 'budgets'), removeUndefinedFields(budget));
    
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Budget;
  },

  // Atualizar orçamento
  update: async (id: string, updates: Partial<Budget>): Promise<Budget> => {
    const budgetRef = doc(db, 'budgets', id);
    await updateDoc(budgetRef, removeUndefinedFields(updates));
    
    const docSnap = await getDoc(budgetRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Budget;
  },

  // Deletar orçamento
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'budgets', id));
  },
};

// ============ METAS FINANCEIRAS ============
export const goalsService = {
  // Obter todas as metas do usuário
  getAll: async (userId: string): Promise<FinancialGoal[]> => {
    const q = query(
      collection(db, 'financial_goals'),
      where('userId', '==', userId),
      orderBy('deadline', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      deadline: timestampToString(doc.data().deadline),
      createdAt: timestampToString(doc.data().createdAt),
      completedAt: doc.data().completedAt ? timestampToString(doc.data().completedAt) : undefined,
    })) as FinancialGoal[];
  },

  // Criar meta
  create: async (goal: Omit<FinancialGoal, 'id' | 'createdAt'>): Promise<FinancialGoal> => {
    const docRef = await addDoc(collection(db, 'financial_goals'), removeUndefinedFields({
      ...goal,
      deadline: stringToTimestamp(goal.deadline),
      createdAt: serverTimestamp(),
    }));
    
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      deadline: timestampToString(data?.deadline),
      createdAt: timestampToString(data?.createdAt),
      completedAt: data?.completedAt ? timestampToString(data.completedAt) : undefined,
    } as FinancialGoal;
  },

  // Atualizar meta
  update: async (id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> => {
    const goalRef = doc(db, 'financial_goals', id);
    
    const updateData: any = { ...updates };
    if (updates.deadline) {
      updateData.deadline = stringToTimestamp(updates.deadline);
    }
    if (updates.completedAt) {
      updateData.completedAt = stringToTimestamp(updates.completedAt);
    }
    
    await updateDoc(goalRef, removeUndefinedFields(updateData));
    
    const docSnap = await getDoc(goalRef);
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      deadline: timestampToString(data?.deadline),
      createdAt: timestampToString(data?.createdAt),
      completedAt: data?.completedAt ? timestampToString(data.completedAt) : undefined,
    } as FinancialGoal;
  },

  // Deletar meta
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'financial_goals', id));
  },
};

// ============ CATEGORIAS PERSONALIZADAS ============
export const categoriesService = {
  // Obter todas as categorias do usuário
  getAll: async (userId: string): Promise<CustomCategory[]> => {
    const q = query(
      collection(db, 'custom_categories'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
    })) as CustomCategory[];
  },

  // Criar categoria
  create: async (category: Omit<CustomCategory, 'id' | 'createdAt'>): Promise<CustomCategory> => {
    const docRef = await addDoc(collection(db, 'custom_categories'), removeUndefinedFields({
      ...category,
      createdAt: serverTimestamp(),
    }));
    
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: timestampToString(docSnap.data()?.createdAt),
    } as CustomCategory;
  },

  // Atualizar categoria
  update: async (id: string, updates: Partial<CustomCategory>): Promise<CustomCategory> => {
    const categoryRef = doc(db, 'custom_categories', id);
    await updateDoc(categoryRef, removeUndefinedFields(updates));
    
    const docSnap = await getDoc(categoryRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: timestampToString(docSnap.data()?.createdAt),
    } as CustomCategory;
  },

  // Deletar categoria
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'custom_categories', id));
  },
};

// ============ DESPESAS AGENDADAS ============
export const scheduledExpensesService = {
  // Obter todas as despesas agendadas do usuário
  getAll: async (userId: string): Promise<ScheduledExpense[]> => {
    const q = query(
      collection(db, 'scheduled_expenses'),
      where('userId', '==', userId),
      orderBy('scheduledDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: timestampToString(doc.data().scheduledDate),
      createdAt: timestampToString(doc.data().createdAt),
    })) as ScheduledExpense[];
  },

  // Criar despesa agendada
  create: async (expense: Omit<ScheduledExpense, 'id' | 'createdAt'>): Promise<ScheduledExpense> => {
    const docRef = await addDoc(collection(db, 'scheduled_expenses'), removeUndefinedFields({
      ...expense,
      scheduledDate: stringToTimestamp(expense.scheduledDate),
      createdAt: serverTimestamp(),
    }));
    
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
      scheduledDate: timestampToString(docSnap.data()?.scheduledDate),
      createdAt: timestampToString(docSnap.data()?.createdAt),
    } as ScheduledExpense;
  },

  // Atualizar despesa agendada
  update: async (id: string, updates: Partial<ScheduledExpense>): Promise<ScheduledExpense> => {
    const expenseRef = doc(db, 'scheduled_expenses', id);
    
    const updateData: any = { ...updates };
    if (updates.scheduledDate) {
      updateData.scheduledDate = stringToTimestamp(updates.scheduledDate);
    }
    
    await updateDoc(expenseRef, removeUndefinedFields(updateData));
    
    const docSnap = await getDoc(expenseRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
      scheduledDate: timestampToString(docSnap.data()?.scheduledDate),
      createdAt: timestampToString(docSnap.data()?.createdAt),
    } as ScheduledExpense;
  },

  // Deletar despesa agendada
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'scheduled_expenses', id));
  },
};


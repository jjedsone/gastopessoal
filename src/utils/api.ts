/**
 * Cliente API para comunicação com o backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Obter token do localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Fazer requisição autenticada
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token inválido ou expirado
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; type: 'single' | 'couple'; partnerId?: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar conta');
    }

    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }

    return response.json();
  },

  verify: async () => {
    const token = getToken();
    if (!token) return { valid: false };

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    } catch {
      return { valid: false };
    }
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: () => fetchWithAuth('/transactions'),
  create: (data: any) => fetchWithAuth('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/transactions/${id}`, {
    method: 'DELETE',
  }),
};

// Budgets API
export const budgetsAPI = {
  getAll: () => fetchWithAuth('/budgets'),
  create: (data: any) => fetchWithAuth('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/budgets/${id}`, {
    method: 'DELETE',
  }),
};

// Goals API
export const goalsAPI = {
  getAll: () => fetchWithAuth('/goals'),
  create: (data: any) => fetchWithAuth('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/goals/${id}`, {
    method: 'DELETE',
  }),
};


/**
 * Cliente API para comunicação com o backend
 */

// @ts-ignore - Vite environment variables
// Detectar ambiente e usar URL apropriada
const getApiUrl = () => {
  // Em produção (Firebase Hosting), usar a mesma origem (Firebase Functions)
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('gastopessoal-ac9aa') || 
        window.location.hostname.includes('firebaseapp.com') ||
        window.location.hostname.includes('web.app')) {
      return '/api'; // Usa o mesmo domínio (Firebase Functions via rewrite)
    }
  }
  
  // Em desenvolvimento, usar localhost ou variável de ambiente
  // @ts-ignore - Vite environment variables
  return (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

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

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta não é JSON:', text.substring(0, 200));
      throw new Error('Servidor retornou resposta inválida. Verifique se o servidor está rodando.');
    }

    if (response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; type: 'single' | 'couple'; partnerId?: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text.substring(0, 200));
        throw new Error('Servidor retornou resposta inválida. Verifique se o servidor está rodando.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `Erro ${response.status}` }));
        throw new Error(error.error || 'Erro ao criar conta');
      }

      return response.json();
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando em http://localhost:3001');
      }
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text.substring(0, 200));
        throw new Error('Servidor retornou resposta inválida. Verifique se o servidor está rodando.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `Erro ${response.status}` }));
        throw new Error(error.error || 'Erro ao fazer login');
      }

      return response.json();
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando em http://localhost:3001');
      }
      throw error;
    }
  },

  verify: async () => {
    const token = getToken();
    if (!token) return { valid: false };

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { valid: false };
      }

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


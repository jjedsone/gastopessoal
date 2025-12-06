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

// Função auxiliar para verificar se a resposta é JSON
const isJsonResponse = (contentType: string | null): boolean => {
  if (!contentType) return false;
  return contentType.includes('application/json') || contentType.includes('text/json');
};

// Função auxiliar para ler resposta de forma segura
const safeJsonParse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type');
  
  if (!isJsonResponse(contentType)) {
    const text = await response.text();
    // Verificar se é HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('Servidor retornou HTML em vez de JSON. Possíveis causas:');
      console.error('1. Servidor não está rodando');
      console.error('2. URL incorreta');
      console.error('3. Erro de roteamento');
      throw new Error('Servidor não está disponível ou retornou resposta inválida. Verifique se o servidor backend está rodando.');
    }
    throw new Error(`Resposta inválida do servidor (tipo: ${contentType}). Esperado JSON.`);
  }
  
  try {
    return await response.json();
  } catch (parseError) {
    const text = await response.text();
    console.error('Erro ao fazer parse do JSON:', parseError);
    console.error('Resposta recebida:', text.substring(0, 500));
    throw new Error('Erro ao processar resposta do servidor.');
  }
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

    if (response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      // Tentar ler erro como JSON, mas tratar se não for
      try {
        const errorData = await safeJsonParse(response);
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      } catch (error: any) {
        if (error.message.includes('Servidor não está disponível')) {
          throw error;
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    }

    return await safeJsonParse(response);
  } catch (error: any) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Erro de rede. Verifique sua conexão e se o servidor está rodando.');
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

      if (!response.ok) {
        try {
          const errorData = await safeJsonParse(response);
          throw new Error(errorData.error || 'Erro ao criar conta');
        } catch (error: any) {
          if (error.message.includes('Servidor não está disponível')) {
            throw error;
          }
          throw new Error(`Erro ${response.status} ao criar conta`);
        }
      }

      return await safeJsonParse(response);
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando em http://localhost:3001');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Erro de rede. Verifique sua conexão e se o servidor está rodando.');
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

      if (!response.ok) {
        try {
          const errorData = await safeJsonParse(response);
          throw new Error(errorData.error || 'Erro ao fazer login');
        } catch (error: any) {
          if (error.message.includes('Servidor não está disponível')) {
            throw error;
          }
          throw new Error(`Erro ${response.status} ao fazer login`);
        }
      }

      return await safeJsonParse(response);
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando em http://localhost:3001');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Erro de rede. Verifique sua conexão e se o servidor está rodando.');
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

      // Se não for JSON, retornar inválido silenciosamente
      const contentType = response.headers.get('content-type');
      if (!isJsonResponse(contentType)) {
        return { valid: false };
      }

      if (!response.ok) {
        return { valid: false };
      }

      return await safeJsonParse(response);
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


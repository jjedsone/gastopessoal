import { usersService } from './firestoreService';
import { User } from '../types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';

// Helper para gerar username único baseado em nome
const generateUsername = (name: string): string => {
  const base = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 20);
  
  const timestamp = Date.now().toString().slice(-6);
  return `${base}_${timestamp}`;
};

export const authService = {
  // Registrar novo usuário
  register: async (data: {
    name: string;
    email: string;
    username?: string;
    password: string;
    type: 'single' | 'couple';
    partnerId?: string;
  }): Promise<{ user: User; token: string }> => {
    try {
      // Gerar username se não fornecido (baseado no email)
      const username = data.username || data.email.split('@')[0] || generateUsername(data.name);

      // Criar usuário no Firebase Auth usando email diretamente
      // O Firebase Auth já previne emails duplicados
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Criar documento do usuário no Firestore
      // Remover campos undefined para evitar erros no Firestore
      const userData: any = {
        name: data.name,
        username: username,
        type: data.type,
      };
      
      // Só adicionar partnerId se tiver valor válido (não undefined, null ou vazio)
      if (data.partnerId && data.partnerId.trim() !== '') {
        userData.partnerId = data.partnerId;
      }

      const user = await usersService.create(firebaseUser.uid, userData);

      // Obter token de acesso
      const token = await firebaseUser.getIdToken();

      return { user, token };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Tratamento específico de erros do Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este email já está em uso');
      }
      
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication não está ativado. Acesse o Firebase Console e ative o Authentication: https://console.firebase.google.com/project/gastopessoal-ac9aa/authentication');
      }
      
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Método de autenticação não está habilitado. Ative Email/Password no Firebase Console.');
      }
      
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        throw new Error('Erro de permissão. Verifique se o Firestore está configurado corretamente.');
      }
      
      // Erro genérico com mensagem mais clara
      const errorMessage = error.message || 'Erro ao criar conta';
      throw new Error(errorMessage);
    }
  },

  // Login com email e password
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      // Fazer login no Firebase Auth usando email diretamente
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Buscar dados do usuário no Firestore
      const user = await usersService.getById(firebaseUser.uid);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Obter token de acesso
      const token = await firebaseUser.getIdToken();

      return { user, token };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou senha incorretos');
      }
      
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      }
      
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication não está ativado. Acesse o Firebase Console e ative o Authentication: https://console.firebase.google.com/project/gastopessoal-ac9aa/authentication');
      }
      
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Método de autenticação não está habilitado. Ative Email/Password no Firebase Console.');
      }
      
      throw new Error(error.message || 'Erro ao fazer login');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw new Error('Erro ao fazer logout');
    }
  },

  // Verificar se usuário está autenticado
  verify: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          unsubscribe();
          
          if (!firebaseUser) {
            resolve({ valid: false });
            return;
          }

          try {
            const user = await usersService.getById(firebaseUser.uid);
            if (user) {
              resolve({ valid: true, user });
            } else {
              resolve({ valid: false });
            }
          } catch (error) {
            resolve({ valid: false });
          }
        });
      });
    } catch (error) {
      return { valid: false };
    }
  },

  // Obter usuário atual
  getCurrentUser: async (): Promise<User | null> => {
    try {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          unsubscribe();
          
          if (!firebaseUser) {
            resolve(null);
            return;
          }

          try {
            const user = await usersService.getById(firebaseUser.uid);
            resolve(user);
          } catch (error) {
            resolve(null);
          }
        });
      });
    } catch (error) {
      return null;
    }
  },
};


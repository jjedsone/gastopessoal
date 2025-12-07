import { usersService } from './firestoreService';
import { User } from '../types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';

// Helper para gerar email único baseado em username
const usernameToEmail = (username: string): string => {
  return `${username}@gastopessoal.local`;
};

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
    username?: string;
    password: string;
    type: 'single' | 'couple';
    partnerId?: string;
  }): Promise<{ user: User; token: string }> => {
    try {
      // Gerar username se não fornecido
      const username = data.username || generateUsername(data.name);
      
      // Verificar se username já existe
      const existingUser = await usersService.getByUsername(username);
      if (existingUser) {
        throw new Error('Nome de usuário já está em uso');
      }

      // Criar usuário no Firebase Auth usando email baseado em username
      const email = usernameToEmail(username);
      const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
      const firebaseUser = userCredential.user;

      // Criar documento do usuário no Firestore
      const userData: Omit<User, 'id'> = {
        name: data.name,
        username: username,
        type: data.type,
        partnerId: data.partnerId,
      };

      const user = await usersService.create(firebaseUser.uid, userData);

      // Obter token de acesso
      const token = await firebaseUser.getIdToken();

      return { user, token };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Nome de usuário já está em uso');
      }
      throw new Error(error.message || 'Erro ao criar conta');
    }
  },

  // Login com username e password
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      // Converter username para email
      const email = usernameToEmail(username);

      // Fazer login no Firebase Auth
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
        throw new Error('Nome de usuário ou senha incorretos');
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


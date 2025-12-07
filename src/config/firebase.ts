import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase
// Credenciais obtidas do Firebase Console
// @ts-ignore - Vite environment variables
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY || "AIzaSyBYOxWOrLXqrPSlICyVKWZ6bDlytWLbzK4",
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || "gastopessoal-ac9aa.firebaseapp.com",
  databaseURL: env?.VITE_FIREBASE_DATABASE_URL || "https://gastopessoal-ac9aa-default-rtdb.firebaseio.com",
  projectId: env?.VITE_FIREBASE_PROJECT_ID || "gastopessoal-ac9aa",
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || "gastopessoal-ac9aa.firebasestorage.app",
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "725746079454",
  appId: env?.VITE_FIREBASE_APP_ID || "1:725746079454:web:cc2a8db58bce248231544f",
  measurementId: env?.VITE_FIREBASE_MEASUREMENT_ID || "G-96JMW7CYPX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);

// Inicializar Analytics (apenas no cliente)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics não disponível:', error);
  }
}

export { analytics };

export default app;


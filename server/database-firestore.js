// Adaptador Firestore para substituir SQLite
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Firebase Admin
let db;

try {
  // Tentar usar credenciais do arquivo de serviço
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Usar variáveis de ambiente ou inicialização padrão
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Inicialização padrão (usa Application Default Credentials)
      admin.initializeApp();
    }
  }
  
  db = admin.firestore();
  console.log('✅ Firestore inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firestore:', error);
  throw error;
}

// Simular interface do SQLite para compatibilidade
const firestoreDB = {
  prepare: (query) => {
    return {
      get: async (...params) => {
        try {
          if (query.includes('SELECT') && query.includes('WHERE email = ?')) {
            const email = params[0];
            const snapshot = await db.collection('users')
              .where('email', '==', email)
              .limit(1)
              .get();
            
            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
          }
          
          if (query.includes('SELECT') && query.includes('WHERE id = ?')) {
            const table = query.match(/FROM (\w+)/)?.[1];
            const id = params[0];
            
            if (table) {
              const doc = await db.collection(table).doc(id).get();
              if (!doc.exists) return null;
              return { id: doc.id, ...doc.data() };
            }
          }
          
          if (query.includes('SELECT') && query.includes('WHERE id = ? AND userId = ?')) {
            const table = query.match(/FROM (\w+)/)?.[1];
            const id = params[0];
            const userId = params[1];
            
            if (table) {
              const doc = await db.collection(table).doc(id).get();
              if (!doc.exists || doc.data().userId !== userId) return null;
              return { id: doc.id, ...doc.data() };
            }
          }
          
          return null;
        } catch (error) {
          console.error('Erro no get:', error);
          return null;
        }
      },
      
      all: async (...params) => {
        try {
          if (query.includes('SELECT') && query.includes('WHERE userId = ?')) {
            const table = query.match(/FROM (\w+)/)?.[1];
            const userId = params[0];
            
            if (table) {
              let queryRef = db.collection(table).where('userId', '==', userId);
              
              // Adicionar ordenação se especificada
              if (query.includes('ORDER BY date DESC')) {
                queryRef = queryRef.orderBy('date', 'desc');
              }
              if (query.includes('ORDER BY createdAt DESC')) {
                queryRef = queryRef.orderBy('createdAt', 'desc');
              }
              
              const snapshot = await queryRef.get();
              return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
          }
          
          return [];
        } catch (error) {
          console.error('Erro no all:', error);
          return [];
        }
      },
      
      run: async (...params) => {
        try {
          if (query.includes('INSERT INTO users')) {
            const [id, name, email, password, type, partnerId, createdAt] = params;
            await db.collection('users').doc(id).set({
              name,
              email,
              password,
              type,
              partnerId: partnerId || null,
              createdAt,
            });
            return { changes: 1 };
          }
          
          if (query.includes('INSERT INTO transactions')) {
            const [id, userId, type, category, amount, description, date, tags, customCategoryId, createdAt] = params;
            await db.collection('transactions').doc(id).set({
              userId,
              type,
              category,
              amount,
              description: description || null,
              date,
              tags: tags || null,
              customCategoryId: customCategoryId || null,
              createdAt,
            });
            return { changes: 1 };
          }
          
          if (query.includes('INSERT INTO budgets')) {
            const [id, userId, category, limit, spent, period, createdAt] = params;
            await db.collection('budgets').doc(id).set({
              userId,
              category,
              limit,
              spent: spent || 0,
              period,
              createdAt,
            });
            return { changes: 1 };
          }
          
          if (query.includes('INSERT INTO financial_goals')) {
            const [id, userId, title, description, targetAmount, currentAmount, deadline, category, isCompleted, createdAt] = params;
            await db.collection('financial_goals').doc(id).set({
              userId,
              title,
              description: description || null,
              targetAmount,
              currentAmount: currentAmount || 0,
              deadline,
              category,
              isCompleted: isCompleted ? true : false,
              completedAt: null,
              createdAt,
            });
            return { changes: 1 };
          }
          
          if (query.includes('UPDATE') && query.includes('WHERE id = ?')) {
            const table = query.match(/UPDATE (\w+)/)?.[1];
            const setClause = query.match(/SET (.+?) WHERE/)?.[1];
            
            if (setClause && table) {
              // Parse dos campos SET
              const fieldMatches = setClause.matchAll(/(\w+)\s*=\s*\?/g);
              const fields = Array.from(fieldMatches, m => m[1]);
              
              // Determinar parâmetros WHERE
              const whereClause = query.match(/WHERE (.+)/)?.[1];
              const whereParams = whereClause ? whereClause.split('AND').length : 0;
              
              const valueParams = params.slice(0, params.length - whereParams);
              const whereValueParams = params.slice(params.length - whereParams);
              
              // Criar objeto de atualização
              const updates = {};
              fields.forEach((field, idx) => {
                if (valueParams[idx] !== undefined) {
                  updates[field] = valueParams[idx];
                }
              });
              
              // Encontrar o documento
              let docRef;
              if (whereClause.includes('id = ?') && whereClause.includes('userId = ?')) {
                const id = whereValueParams[whereValueParams.length - 2];
                const userId = whereValueParams[whereValueParams.length - 1];
                docRef = db.collection(table).doc(id);
                
                // Verificar se o documento pertence ao usuário
                const doc = await docRef.get();
                if (!doc.exists || doc.data().userId !== userId) {
                  return { changes: 0 };
                }
              } else if (whereClause.includes('id = ?')) {
                const id = whereValueParams[0];
                docRef = db.collection(table).doc(id);
              }
              
              if (docRef) {
                await docRef.update(updates);
                return { changes: 1 };
              }
            }
          }
          
          if (query.includes('DELETE') && query.includes('WHERE id = ?')) {
            const table = query.match(/FROM (\w+)/)?.[1];
            const whereClause = query.match(/WHERE (.+)/)?.[1];
            
            let docRef;
            if (whereClause && whereClause.includes('userId = ?')) {
              const id = params[params.length - 2];
              const userId = params[params.length - 1];
              docRef = db.collection(table).doc(id);
              
              // Verificar se o documento pertence ao usuário
              const doc = await docRef.get();
              if (!doc.exists || doc.data().userId !== userId) {
                return { changes: 0 };
              }
            } else {
              const id = params[params.length - 1];
              docRef = db.collection(table).doc(id);
            }
            
            if (docRef) {
              await docRef.delete();
              return { changes: 1 };
            }
          }
          
          return { changes: 0 };
        } catch (error) {
          console.error('Erro no run:', error);
          return { changes: 0 };
        }
      },
    };
  },
  
  exec: (sql) => {
    // CREATE TABLE não é necessário no Firestore
    return true;
  },
  
  pragma: (command) => {
    // Pragma não aplicável ao Firestore
    return true;
  },
  
  close: () => {
    // Firestore não precisa de close explícito
  },
};

export default firestoreDB;


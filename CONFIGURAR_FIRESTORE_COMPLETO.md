# 🔥 Configuração Completa do Firestore

## ⚠️ Problema: Dados não persistem

Se os dados não estão sendo salvos ou carregados, siga este guia completo.

## ✅ Checklist de Configuração

### 1. Ativar Firestore no Firebase Console

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore
2. Se você ver "Get started" ou "Criar banco de dados", clique nele
3. Escolha o modo:
   - **Modo de produção** (recomendado) - Regras mais restritivas
   - **Modo de teste** - Permite leitura/escrita por 30 dias (para desenvolvimento)
4. Escolha a localização: **nam5** (já configurada)
5. Clique em **"Criar"**

### 2. Verificar Regras do Firestore

As regras devem permitir acesso autenticado:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Para verificar:**
1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore/rules
2. Verifique se as regras estão como acima
3. Se não estiverem, atualize e clique em **"Publicar"**

### 3. Criar Índices Necessários

O Firestore precisa de índices para consultas com `orderBy` e `where`.

**Índice necessário:**
- Coleção: `transactions`
- Campos: `userId` (Ascending), `date` (Descending)

**Como criar:**

**Opção A: Automático (quando aparecer erro)**
1. Quando você tentar fazer uma consulta, o Firebase mostrará um link de erro
2. Clique no link para criar o índice automaticamente
3. Aguarde alguns minutos para o índice ser criado

**Opção B: Manual**
1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore/indexes
2. Clique em **"Criar índice"**
3. Coleção: `transactions`
4. Adicione campo:
   - `userId` - Ascending
   - `date` - Descending
5. Clique em **"Criar"**

### 4. Verificar Firebase Authentication

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/authentication
2. Verifique se **Email/Password** está ativado
3. Se não estiver, ative seguindo o guia `ATIVAR_EMAIL_PASSWORD.md`

### 5. Testar no Console do Navegador

Abra o console do navegador (F12) e verifique:

1. **Ao fazer login:**
   - Deve aparecer: `🔄 Carregando dados do Firestore para usuário: [userId]`
   - Deve aparecer: `✅ Transações carregadas: [número]`
   - Deve aparecer: `✅ Orçamentos carregados: [número]`

2. **Ao criar transação:**
   - Deve aparecer: `💾 Salvando transação no Firestore: [dados]`
   - Deve aparecer: `✅ Transação salva com sucesso: [id]`

3. **Se houver erros:**
   - Verifique a mensagem de erro no console
   - Erros comuns:
     - `permission-denied` → Regras do Firestore não permitem acesso
     - `failed-precondition` → Índice não criado
     - `unauthenticated` → Usuário não está autenticado

## 🔍 Verificar Dados no Firestore

1. Acesse: https://console.firebase.google.com/project/gastopessoal-ac9aa/firestore/data
2. Você deve ver as coleções:
   - `users` - Dados dos usuários
   - `transactions` - Transações financeiras
   - `budgets` - Orçamentos
   - `financial_goals` - Metas financeiras
   - `custom_categories` - Categorias personalizadas
   - `scheduled_expenses` - Despesas agendadas

3. Clique em uma coleção para ver os documentos
4. Verifique se há dados salvos

## 🛠️ Solução de Problemas

### Problema: "Permission denied"

**Solução:**
1. Verifique se o usuário está autenticado
2. Verifique as regras do Firestore
3. Certifique-se de que as regras permitem acesso autenticado

### Problema: "Index not found" ou "failed-precondition"

**Solução:**
1. Crie o índice necessário (veja passo 3 acima)
2. Aguarde alguns minutos para o índice ser criado
3. Tente novamente

### Problema: Dados não aparecem após criar

**Solução:**
1. Verifique o console do navegador para erros
2. Verifique se o Firestore está ativado
3. Verifique se as regras permitem escrita
4. Recarregue a página

### Problema: Dados desaparecem ao fazer logout/login

**Solução:**
1. Verifique se os dados estão sendo salvos no Firestore (veja passo "Verificar Dados")
2. Verifique se o código está carregando os dados corretamente
3. Verifique o console para erros de carregamento

## 📋 Checklist Final

- [ ] Firestore está ativado
- [ ] Regras do Firestore permitem acesso autenticado
- [ ] Índices necessários foram criados
- [ ] Firebase Authentication está ativado
- [ ] Email/Password está habilitado
- [ ] Dados aparecem no console do Firestore
- [ ] Console do navegador não mostra erros
- [ ] Dados persistem após logout/login

## 🎯 Após Configurar

1. Faça logout e login novamente
2. Crie uma transação de teste
3. Verifique se ela aparece no Firestore Console
4. Faça logout e login novamente
5. Verifique se a transação ainda está lá

Se tudo estiver configurado corretamente, os dados devem persistir!


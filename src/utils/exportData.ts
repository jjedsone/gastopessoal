/**
 * Utilitários para exportação de dados
 */

import { Transaction, Budget } from '../types';
import { formatCurrency, formatDate } from './format';

/**
 * Exporta transações para CSV
 */
export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Data de Criação'];
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      formatDate(t.date),
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category,
      `"${t.description || ''}"`,
      t.amount.toFixed(2),
      new Date(t.createdAt).toLocaleString('pt-BR'),
    ].join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporta dados para Excel (formato CSV compatível)
 */
export const exportToExcel = (transactions: Transaction[], budgets: Budget[]): void => {
  const workbook = {
    transactions: transactions.map(t => ({
      Data: formatDate(t.date),
      Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
      Categoria: t.category,
      Descrição: t.description || '',
      Valor: t.amount,
      'Data de Criação': new Date(t.createdAt).toLocaleString('pt-BR'),
    })),
    budgets: budgets.map(b => ({
      Categoria: b.category,
      Limite: b.limit,
      Gasto: b.spent,
      Período: b.period === 'monthly' ? 'Mensal' : 'Semanal',
    })),
  };
  
  // Criar CSV para transações
  const transactionsCSV = [
    ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Data de Criação'].join(','),
    ...workbook.transactions.map(t => [
      t.Data,
      t.Tipo,
      t.Categoria,
      `"${t.Descrição}"`,
      t.Valor.toFixed(2),
      t['Data de Criação'],
    ].join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + transactionsCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Gera relatório em texto formatado
 */
export const generateTextReport = (
  transactions: Transaction[],
  budgets: Budget[],
  summary: { totalIncome: number; totalExpenses: number; balance: number; savingsRate: number }
): string => {
  const report: string[] = [];
  
  report.push('═══════════════════════════════════════════════════════');
  report.push('           RELATÓRIO FINANCEIRO MENSAL');
  report.push('═══════════════════════════════════════════════════════');
  report.push(`Data: ${new Date().toLocaleDateString('pt-BR')}`);
  report.push('');
  
  report.push('📊 RESUMO FINANCEIRO');
  report.push('───────────────────────────────────────────────────────');
  report.push(`Receitas Totais:     ${formatCurrency(summary.totalIncome)}`);
  report.push(`Despesas Totais:     ${formatCurrency(summary.totalExpenses)}`);
  report.push(`Saldo:               ${formatCurrency(summary.balance)}`);
  report.push(`Taxa de Poupança:    ${summary.savingsRate.toFixed(1)}%`);
  report.push('');
  
  if (budgets.length > 0) {
    report.push('🎯 ORÇAMENTOS');
    report.push('───────────────────────────────────────────────────────');
    budgets.forEach(budget => {
      const percentage = (budget.spent / budget.limit) * 100;
      const status = percentage > 100 ? '🔴 Ultrapassado' : percentage > 80 ? '🟡 Atenção' : '🟢 OK';
      report.push(`${budget.category}: ${status}`);
      report.push(`  Limite: ${formatCurrency(budget.limit)} | Gasto: ${formatCurrency(budget.spent)} (${percentage.toFixed(1)}%)`);
    });
    report.push('');
  }
  
  report.push('💰 TRANSAÇÕES');
  report.push('───────────────────────────────────────────────────────');
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  if (incomeTransactions.length > 0) {
    report.push('RECEITAS:');
    incomeTransactions.forEach(t => {
      report.push(`  ${formatDate(t.date)} | ${t.category} | ${formatCurrency(t.amount)}`);
    });
    report.push('');
  }
  
  if (expenseTransactions.length > 0) {
    report.push('DESPESAS:');
    expenseTransactions.forEach(t => {
      report.push(`  ${formatDate(t.date)} | ${t.category} | ${formatCurrency(t.amount)}`);
    });
  }
  
  report.push('');
  report.push('═══════════════════════════════════════════════════════');
  report.push('Gerado por Gasto Pessoal - Gestão Financeira Inteligente');
  report.push('═══════════════════════════════════════════════════════');
  
  return report.join('\n');
};

/**
 * Exporta relatório como arquivo de texto
 */
export const exportReportToText = (
  transactions: Transaction[],
  budgets: Budget[],
  summary: { totalIncome: number; totalExpenses: number; balance: number; savingsRate: number }
): void => {
  const report = generateTextReport(transactions, budgets, summary);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copia dados para área de transferência
 */
export const copyToClipboard = (text: string): Promise<void> => {
  return navigator.clipboard.writeText(text);
};


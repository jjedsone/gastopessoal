import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { Download, FileText, FileSpreadsheet, Copy, Printer } from 'lucide-react';
import { exportTransactionsToCSV, exportToExcel, exportReportToText, generateTextReport, copyToClipboard } from '../utils/exportData';
import './ExportData.css';

const ExportData: React.FC = () => {
  const { transactions, budgets, getFinancialSummary } = useFinance();
  const { showNotification } = useNotification();
  const [isExporting, setIsExporting] = useState(false);

  const summary = getFinancialSummary();

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      exportTransactionsToCSV(transactions);
      showNotification('Transações exportadas para CSV com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao exportar dados', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      exportToExcel(transactions, budgets);
      showNotification('Dados exportados para Excel com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao exportar dados', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      exportReportToText(transactions, budgets, summary);
      showNotification('Relatório exportado com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao exportar relatório', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyReport = async () => {
    try {
      setIsExporting(true);
      const report = generateTextReport(transactions, budgets, summary);
      await copyToClipboard(report);
      showNotification('Relatório copiado para área de transferência!', 'success');
    } catch (error) {
      showNotification('Erro ao copiar relatório', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const report = generateTextReport(transactions, budgets, summary);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório Financeiro</title>
            <style>
              body { font-family: monospace; padding: 20px; white-space: pre-wrap; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${report.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="export-data">
      <div className="export-header">
        <Download size={24} />
        <h2>Exportar Dados</h2>
        <p>Exporte suas informações financeiras em diferentes formatos</p>
      </div>

      <div className="export-options">
        <div className="export-card" onClick={handleExportCSV}>
          <div className="export-icon csv">
            <FileSpreadsheet size={32} />
          </div>
          <h3>Exportar CSV</h3>
          <p>Exporte transações para CSV (Excel compatível)</p>
          <button className="export-btn" disabled={isExporting || transactions.length === 0}>
            <Download size={18} />
            Exportar CSV
          </button>
        </div>

        <div className="export-card" onClick={handleExportExcel}>
          <div className="export-icon excel">
            <FileSpreadsheet size={32} />
          </div>
          <h3>Exportar Excel</h3>
          <p>Exporte transações e orçamentos para Excel</p>
          <button className="export-btn" disabled={isExporting || transactions.length === 0}>
            <Download size={18} />
            Exportar Excel
          </button>
        </div>

        <div className="export-card" onClick={handleExportReport}>
          <div className="export-icon report">
            <FileText size={32} />
          </div>
          <h3>Relatório Completo</h3>
          <p>Gere relatório detalhado em formato texto</p>
          <button className="export-btn" disabled={isExporting}>
            <Download size={18} />
            Gerar Relatório
          </button>
        </div>

        <div className="export-card" onClick={handleCopyReport}>
          <div className="export-icon copy">
            <Copy size={32} />
          </div>
          <h3>Copiar Relatório</h3>
          <p>Copie o relatório para área de transferência</p>
          <button className="export-btn" disabled={isExporting}>
            <Copy size={18} />
            Copiar
          </button>
        </div>

        <div className="export-card" onClick={handlePrint}>
          <div className="export-icon print">
            <Printer size={32} />
          </div>
          <h3>Imprimir</h3>
          <p>Imprima o relatório financeiro</p>
          <button className="export-btn" disabled={isExporting}>
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>

      <div className="export-info">
        <h3>Informações sobre Exportação</h3>
        <ul>
          <li>CSV: Formato compatível com Excel, Google Sheets e outros programas</li>
          <li>Excel: Inclui múltiplas abas com transações e orçamentos</li>
          <li>Relatório: Formato texto formatado com todas as informações</li>
          <li>Os arquivos são baixados automaticamente no seu dispositivo</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportData;


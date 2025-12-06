import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import AIAssistant from './components/AIAssistant';
import Investments from './components/Investments';
import Profile from './components/Profile';
import ExportData from './components/ExportData';
import FinancialGoals from './components/FinancialGoals';
import CustomCategories from './components/CustomCategories';
import ScheduledExpenses from './components/ScheduledExpenses';
import AdvancedCharts from './components/AdvancedCharts';
import PatternAnalysis from './components/PatternAnalysis';
import Layout from './components/Layout';
import { useFinance } from './context/FinanceContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useFinance();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="investments" element={<Investments />} />
        <Route path="goals" element={<FinancialGoals />} />
        <Route path="export" element={<ExportData />} />
        <Route path="categories" element={<CustomCategories />} />
        <Route path="scheduled" element={<ScheduledExpenses />} />
        <Route path="charts" element={<AdvancedCharts />} />
        <Route path="patterns" element={<PatternAnalysis />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <FinanceProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
            <AppRoutes />
          </Router>
        </FinanceProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;


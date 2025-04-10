import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Scan from './pages/Scan';
import Layout from './components/Layout';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { MonthContextProvider } from './hooks/use-month-context';

// Import the CurrencyProvider
import { CurrencyProvider } from "@/hooks/use-currency";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CurrencyProvider>
        <AuthProvider>
          <MonthContextProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
                <Route path="/budget" element={<Layout><Budget /></Layout>} />
                <Route path="/scan" element={<Layout><Scan /></Layout>} />
              </Routes>
            </Router>
          </MonthContextProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;

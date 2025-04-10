
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Layout from './components/Layout';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from "./components/ui/theme-provider";
import { MonthProvider } from './hooks/use-month-context';

// Import the CurrencyProvider
import { CurrencyProvider } from "@/hooks/use-currency";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CurrencyProvider>
        <AuthProvider>
          <MonthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
                <Route path="/budget" element={<Layout><Budget /></Layout>} />
              </Routes>
            </Router>
          </MonthProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;

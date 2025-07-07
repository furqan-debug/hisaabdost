
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { CurrencyProvider } from '@/hooks/use-currency';
import { MonthProvider } from '@/hooks/use-month-context';
import { OfflineProvider } from '@/components/offline/OfflineProvider';
import { AuthProvider, useAuth } from '@/lib/auth';
import { FinnyProvider } from '@/components/finny/FinnyProvider';
import { ThemeProvider } from 'next-themes';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Expenses from '@/pages/Expenses';
import Analytics from '@/pages/Analytics';
import Budget from '@/pages/Budget';
import Goals from '@/pages/Goals';  
import History from '@/pages/History';
import ManageFunds from '@/pages/ManageFunds';
import AppGuide from '@/pages/AppGuide';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';

// Components
import Layout from '@/components/Layout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading app..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="budget" element={<Budget />} />
        <Route path="goals" element={<Goals />} />
        <Route path="history" element={<History />} />
        <Route path="manage-funds" element={<ManageFunds />} />
        <Route path="guide" element={<AppGuide />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  console.log('🚀 App component rendering');

  return (
    <div className="App">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              <MonthProvider>
                <OfflineProvider>
                  <FinnyProvider>
                    <Router>
                      <div className="min-h-screen bg-background">
                        <AppRoutes />
                      </div>
                    </Router>
                    <Toaster />
                  </FinnyProvider>
                </OfflineProvider>
              </MonthProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;

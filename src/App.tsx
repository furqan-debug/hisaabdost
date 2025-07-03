
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/auth';
import { MonthProvider } from './hooks/use-month-context';
import { FinnyProvider } from './components/finny/FinnyProvider';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import History from './pages/History';
import ManageFunds from './pages/ManageFunds';
import NotFound from './pages/NotFound';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Initialize push notifications with error handling
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        const { PushNotificationService } = await import('./services/pushNotificationService');
        await PushNotificationService.initialize();
      } catch (error) {
        console.log('Push notifications not available:', error);
        // Continue app initialization even if push notifications fail
      }
    };

    initializePushNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <FinnyProvider>
          <AuthProvider>
            <MonthProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/app" element={<Layout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="history" element={<History />} />
                  <Route path="manage-funds" element={<ManageFunds />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
                <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </MonthProvider>
          </AuthProvider>
        </FinnyProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

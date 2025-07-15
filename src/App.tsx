
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Expenses from '@/pages/Expenses';
import Budget from '@/pages/Budget';
import Analytics from '@/pages/Analytics';
import Goals from '@/pages/Goals';
import Settings from '@/pages/Settings';
import History from '@/pages/History';
import ManageFunds from '@/pages/ManageFunds';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/lib/auth';
import { MonthProvider } from '@/hooks/use-month-context';
import { CurrencyProvider } from '@/hooks/use-currency';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error?.message?.includes('Failed to fetch')) return failureCount < 2;
        return failureCount < 1;
      },
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={true}
          storageKey="hisaabdost-theme"
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <MonthProvider>
              <CurrencyProvider>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/app" element={<Layout />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="budget" element={<Budget />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="history" element={<History />} />
                    <Route path="manage-funds" element={<ManageFunds />} />
                  </Route>
                  <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                </Routes>
                
                <Toaster />
                <SonnerToaster />
                <ReactQueryDevtools initialIsOpen={false} />
              </CurrencyProvider>
            </MonthProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

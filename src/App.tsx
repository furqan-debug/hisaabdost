
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { CurrencyProvider } from "@/hooks/use-currency";
import { MonthProvider } from "@/hooks/use-month-context";
import { FinnyProvider } from "@/components/finny/context/FinnyContext";

// Import pages
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const App = () => {
  console.log('🚀 App component rendering with full functionality...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <CurrencyProvider>
              <MonthProvider>
                <FinnyProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route 
                        path="/app/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                    </Routes>
                  </BrowserRouter>
                  <Toaster />
                  <Sonner />
                </FinnyProvider>
              </MonthProvider>
            </CurrencyProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

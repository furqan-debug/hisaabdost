
import React, { useState, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SplashScreen } from "@/components/splash/SplashScreen";

import Layout from "@/components/Layout";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { MonthProvider } from "@/hooks/use-month-context";
import { CurrencyProvider } from "@/hooks/use-currency";
import { FinnyProvider } from "@/components/finny/FinnyProvider";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

// Lazy load pages for better code splitting
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Expenses = React.lazy(() => import("@/pages/Expenses"));
const Budget = React.lazy(() => import("@/pages/Budget"));
const Analytics = React.lazy(() => import("@/pages/Analytics"));
const Goals = React.lazy(() => import("@/pages/Goals"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const Index = React.lazy(() => import("@/pages/Index"));

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Add caching to reduce network requests
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Limit retries to reduce blocking time
    },
  },
});

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <AuthProvider>
              <CurrencyProvider>
                <MonthProvider>
                  <FinnyProvider>
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <Suspense fallback={<LoadingScreen message="Loading..." />}>
                            <Index />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/auth" 
                        element={
                          <Suspense fallback={<LoadingScreen message="Loading authentication..." />}>
                            <Auth />
                          </Suspense>
                        } 
                      />
                      <Route path="/app" element={<Layout />}>
                        <Route index element={<Navigate to="/app/dashboard" replace />} />
                        <Route 
                          path="dashboard" 
                          element={
                            <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
                              <Dashboard />
                            </Suspense>
                          }
                        />
                        <Route 
                          path="expenses" 
                          element={
                            <Suspense fallback={<LoadingScreen message="Loading expenses..." />}>
                              <Expenses />
                            </Suspense>
                          }
                        />
                        <Route 
                          path="budget" 
                          element={
                            <Suspense fallback={<LoadingScreen message="Loading budget..." />}>
                              <Budget />
                            </Suspense>
                          }
                        />
                        <Route 
                          path="analytics" 
                          element={
                            <Suspense fallback={<LoadingScreen message="Loading analytics..." />}>
                              <Analytics />
                            </Suspense>
                          }
                        />
                        <Route 
                          path="goals" 
                          element={
                            <Suspense fallback={<LoadingScreen message="Loading goals..." />}>
                              <Goals />
                            </Suspense>
                          }
                        />
                        <Route 
                          path="*" 
                          element={
                            <Suspense fallback={<LoadingScreen />}>
                              <NotFound />
                            </Suspense>
                          }
                        />
                      </Route>
                      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                    </Routes>
                    <Toaster />
                  </FinnyProvider>
                </MonthProvider>
              </CurrencyProvider>
            </AuthProvider>
          )}
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

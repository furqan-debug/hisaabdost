
import React, { useState, Suspense, useEffect } from "react";
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
import { App as CapacitorApp } from '@capacitor/app';

// Import all pages directly to avoid dynamic import issues
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Budget from "@/pages/Budget";
import Analytics from "@/pages/Analytics";
import Goals from "@/pages/Goals";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";

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

  // Handle deep links
  useEffect(() => {
    const initDeepLinks = async () => {
      try {
        // Set up the deep link listener
        CapacitorApp.addListener('appUrlOpen', (data: { url: string }) => {
          console.log('Deep link opened: ', data.url);
          
          // Parse the URL
          const url = new URL(data.url);
          
          // Handle password reset deep links
          if (url.pathname.includes('reset-password') || 
              url.host === 'reset-password') {
            
            // Extract token from the URL if present
            const params = new URLSearchParams(url.search);
            const token = params.get('token') || null;
            
            // Get the path within your app to navigate to
            const navigatePath = `/auth/reset-password${token ? `?token=${token}` : ''}`;
            
            // Navigate to the path
            window.location.href = navigatePath;
          }
        });
      } catch (error) {
        console.error('Error setting up deep link handler:', error);
      }
    };

    initDeepLinks();
  }, []);

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
                        element={<Index />} 
                      />
                      <Route 
                        path="/auth" 
                        element={
                          <Suspense fallback={<LoadingScreen message="Loading authentication..." />}>
                            <Auth />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/auth/reset-password" 
                        element={
                          <Suspense fallback={<LoadingScreen message="Loading password reset..." />}>
                            <ResetPassword />
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

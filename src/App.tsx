
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import History from "./pages/History";
import ManageFunds from "./pages/ManageFunds";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "./components/ui/sidebar";
import { MonthProvider } from "./hooks/use-month-context";
import { FinnyProvider } from "./components/finny";
import { AuthProvider } from "./lib/auth";
import { SplashScreen } from "./components/splash/SplashScreen";
import { useState, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Simulate app initialization time
    const initializeApp = async () => {
      // Wait for minimum splash duration (reduced for faster loading)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if critical resources are loaded
      if (document.readyState === 'complete') {
        setIsLoading(false);
      } else {
        // Wait for document to be ready
        const handleLoad = () => {
          setIsLoading(false);
          window.removeEventListener('load', handleLoad);
        };
        window.addEventListener('load', handleLoad);
        
        // Fallback timeout to prevent infinite loading
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      }
    };

    initializeApp();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash || isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <FinnyProvider>
              <AuthProvider>
                <MonthProvider>
                  <SidebarProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route path="/" element={<Navigate to="/auth" replace />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="/app" element={<Layout />}>
                        <Route index element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="budget" element={<Budget />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="goals" element={<Goals />} />
                        <Route path="history" element={<History />} />
                        <Route path="manage-funds" element={<ManageFunds />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </SidebarProvider>
                </MonthProvider>
              </AuthProvider>
            </FinnyProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

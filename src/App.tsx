
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "next-themes";
import { FinnyProvider } from "@/components/finny";
import { MonthProvider } from "@/hooks/use-month-context";
import { CurrencyProvider } from "@/hooks/use-currency";
import { OfflineProvider } from "@/components/offline/OfflineProvider";
import { OfflineStatusIndicator } from "@/components/offline/OfflineStatusIndicator";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Analytics from "@/pages/Analytics";
import Budget from "@/pages/Budget";
import Goals from "@/pages/Goals";
import History from "@/pages/History";
import ManageFunds from "@/pages/ManageFunds";
import TestNotifications from "@/pages/TestNotifications";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";
import "./App.css";
import "./styles/optimized-animations.css";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter>
            <AuthProvider>
              <CurrencyProvider>
                <MonthProvider>
                  <FinnyProvider>
                    <OfflineProvider>
                      <div className="App">
                        <Routes>
                          <Route path="/" element={<Navigate to="/auth" replace />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/auth/reset-password" element={<ResetPassword />} />
                          <Route path="/app" element={<Layout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="expenses" element={<Expenses />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="budget" element={<Budget />} />
                            <Route path="goals" element={<Goals />} />
                            <Route path="history" element={<History />} />
                            <Route path="manage-funds" element={<ManageFunds />} />
                            <Route path="test-notifications" element={<TestNotifications />} />
                            <Route index element={<Navigate to="dashboard" replace />} />
                          </Route>
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <OfflineStatusIndicator />
                        <Toaster position="top-right" />
                      </div>
                    </OfflineProvider>
                  </FinnyProvider>
                </MonthProvider>
              </CurrencyProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

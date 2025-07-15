
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { CurrencyProvider } from "@/hooks/use-currency";
import { MonthProvider } from "@/hooks/use-month-context";
import { FinnyProvider } from "@/components/finny";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Analytics from "@/pages/Analytics";
import Expenses from "@/pages/Expenses";
import Goals from "@/pages/Goals";
import Budget from "@/pages/Budget";
import Settings from "@/pages/Settings";
import FinnyChat from "@/pages/FinnyChat";
import History from "@/pages/History";
import ManageFunds from "@/pages/ManageFunds";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CurrencyProvider>
              <MonthProvider>
                <FinnyProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/app" element={<Layout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="finny" element={<FinnyChat />} />
                  <Route path="history" element={<History />} />
                  <Route path="manage-funds" element={<ManageFunds />} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Route>
                <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              </Routes>
                </FinnyProvider>
              </MonthProvider>
            </CurrencyProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

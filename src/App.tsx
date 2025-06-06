
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import History from "./pages/History";
import ManageFunds from "./pages/ManageFunds";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CurrencyProvider } from "@/hooks/use-currency";
import { MonthProvider } from "@/hooks/use-month-context";
import { FinnyProvider } from "./components/finny/FinnyProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CurrencyProvider>
          <MonthProvider>
            <FinnyProvider>
              <SidebarProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
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
                  <Toaster />
                </Router>
              </SidebarProvider>
            </FinnyProvider>
          </MonthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

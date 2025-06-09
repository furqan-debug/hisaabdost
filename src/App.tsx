
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "next-themes";
import { FinnyProvider } from "@/components/finny";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Analytics from "@/pages/Analytics";
import Budget from "@/pages/Budget";
import Goals from "@/pages/Goals";
import History from "@/pages/History";
import ManageFunds from "@/pages/ManageFunds";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <FinnyProvider>
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
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </FinnyProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

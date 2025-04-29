
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SplashScreen } from "@/components/splash/SplashScreen";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Budget from "@/pages/Budget";
import Analytics from "@/pages/Analytics";
import Goals from "@/pages/Goals";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { MonthProvider } from "@/hooks/use-month-context";
import { CurrencyProvider } from "@/hooks/use-currency";
import { FinnyProvider } from "@/components/finny/FinnyProvider";

import "./App.css";

const queryClient = new QueryClient();

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
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/app" element={<Layout />}>
                        <Route index element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="budget" element={<Budget />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="goals" element={<Goals />} />
                        <Route path="*" element={<NotFound />} />
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

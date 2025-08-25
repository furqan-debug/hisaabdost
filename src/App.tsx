
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Simple components to test
const SimpleAuth = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1>Auth Page</h1>
  </div>
);

const SimpleDashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1>Dashboard Working!</h1>
  </div>
);

// Create a simple QueryClient without complex configurations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log('🎯 App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<SimpleAuth />} />
              <Route path="*" element={<SimpleDashboard />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

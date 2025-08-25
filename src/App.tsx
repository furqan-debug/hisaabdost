
import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Simple test components
const SimpleAuth: React.FC = () => {
  console.log('🔑 SimpleAuth component rendering');
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Auth Page</h1>
        <p className="text-gray-600">Authentication component loaded successfully</p>
      </div>
    </div>
  );
};

const SimpleDashboard: React.FC = () => {
  console.log('📊 SimpleDashboard component rendering');
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Dashboard Working!</h1>
        <p className="text-gray-600">Main application loaded successfully</p>
      </div>
    </div>
  );
};

// Create QueryClient with minimal config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  console.log('🚀 App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<SimpleAuth />} />
              <Route path="*" element={<SimpleDashboard />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

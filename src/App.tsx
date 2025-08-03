
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Budget from '@/pages/Budget';
import History from '@/pages/History';
import ManageFunds from '@/pages/ManageFunds';
import Guide from '@/pages/Guide';
import ManageCategories from '@/pages/ManageCategories';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MonthProvider } from '@/hooks/use-month-context';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Router>
          <AuthProvider>
            <MonthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/app/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/budget"
                  element={
                    <ProtectedRoute>
                      <Budget />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/manage-funds"
                  element={
                    <ProtectedRoute>
                      <ManageFunds />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/guide"
                  element={
                    <ProtectedRoute>
                      <Guide />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/manage-categories"
                  element={
                    <ProtectedRoute>
                      <ManageCategories />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              </Routes>
            </MonthProvider>
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

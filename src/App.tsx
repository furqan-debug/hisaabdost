
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "next-themes";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for hash params (for OAuth login)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        
        if (accessToken) {
          // Handle OAuth login
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });
          
          if (error) {
            console.error("Error setting session:", error);
            toast.error("Authentication failed. Please try again.");
            navigate("/auth");
            return;
          }
          
          toast.success("Successfully authenticated!");
          navigate("/dashboard");
        } else {
          // Handle email verification or other auth callbacks
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            toast.success("Successfully authenticated!");
            navigate("/dashboard");
          } else {
            navigate("/auth");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed. Please try again.");
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-pulse">
        <h2 className="text-2xl font-medium mb-2">Verifying your account...</h2>
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

const AppWithProviders = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/verify" element={<AuthCallback />} />
              <Route path="/" element={<Index />} />
              <Route 
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Expenses />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Budget />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Goals />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default AppWithProviders;

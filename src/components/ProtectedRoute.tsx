
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  console.log('🔐 ProtectedRoute check:', { hasUser: !!user, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔐 No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('🔐 User authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;

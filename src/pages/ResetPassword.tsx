
import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL parameters (for deep links)
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("access_token");
    
    // Also check the URL hash (standard Supabase redirect format)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashToken = hashParams.get("access_token");
    
    setToken(accessToken || hashToken);
  }, [location]);

  // Redirect already logged in users
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-md"
      >
        <Card className="border-primary/10 shadow-lg backdrop-blur bg-card/90">
          <CardHeader className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2"
            >
              <Lock className="h-6 w-6 text-primary" />
            </motion.div>
            <CardTitle className="text-center text-xl md:text-2xl">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password to complete the reset process
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResetPasswordForm 
              token={token || undefined}
              onBackToLogin={() => navigate("/auth")}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

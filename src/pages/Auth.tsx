
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { VerificationForm } from "@/components/auth/VerificationForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

const Auth = () => {
  const { user, signInWithGoogle, verifyOtp, resendOtp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleGoBack = () => {
    navigate('/');
  };

  const handleVerification = async (code: string) => {
    await verifyOtp(verificationEmail, code);
  };

  const handleResendVerification = async () => {
    await resendOtp(verificationEmail);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20 relative">
      <Button 
        variant="glass" 
        size="icon" 
        className="absolute top-4 left-4 hover:bg-[#6E59A5]/10 transition-all duration-300 backdrop-blur-md border border-[#6E59A5]/20 shadow-sm"
        onClick={handleGoBack}
      >
        <ArrowLeft className="h-5 w-5 text-[#6E59A5]" />
      </Button>

      <AnimatePresence mode="wait">
        <motion.div
          key={showVerification ? "verification" : showForgotPassword ? "forgot" : isSignUp ? "signup" : "login"}
          initial="hidden"
          animate="visible"
          exit="exit"
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
                <User className="h-6 w-6 text-primary" />
              </motion.div>
              <CardTitle className="text-center text-xl md:text-2xl">
                {showVerification 
                  ? "Verify your email"
                  : showForgotPassword
                  ? "Reset Password"
                  : isSignUp
                  ? "Create an account"
                  : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-center">
                {showVerification 
                  ? `Enter the 6-digit verification code sent to ${verificationEmail}`
                  : showForgotPassword
                  ? "Enter your email and we'll send you a link to reset your password"
                  : isSignUp
                  ? "Sign up to start managing your expenses"
                  : "Sign in to your account"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {showVerification ? (
                <VerificationForm
                  email={verificationEmail}
                  onVerify={handleVerification}
                  onResend={handleResendVerification}
                  onBackToLogin={() => {
                    setShowVerification(false);
                    setVerificationEmail("");
                  }}
                />
              ) : showForgotPassword ? (
                <ForgotPasswordForm
                  onBackToLogin={() => setShowForgotPassword(false)}
                />
              ) : isSignUp ? (
                <SignUpForm
                  onLoginClick={() => setIsSignUp(false)}
                  onGoogleSignIn={signInWithGoogle}
                  onSignUpSuccess={(email) => {
                    setVerificationEmail(email);
                    setShowVerification(true);
                  }}
                />
              ) : (
                <LoginForm
                  onForgotPassword={() => setShowForgotPassword(true)}
                  onSignUpClick={() => setIsSignUp(true)}
                  onGoogleSignIn={signInWithGoogle}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Auth;

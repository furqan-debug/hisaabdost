import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthOptional } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { VerificationForm } from "@/components/auth/VerificationForm";
import { PasswordResetCodeForm } from "@/components/auth/PasswordResetCodeForm";
import { SetNewPasswordForm } from "@/components/auth/SetNewPasswordForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
const Auth = () => {
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const verifyOtp = auth?.verifyOtp ?? (async () => {});
  const resendOtp = auth?.resendOtp ?? (async () => {});
  const sendPasswordResetCode = auth?.sendPasswordResetCode ?? (async () => {});
  const [isSignUp, setIsSignUp] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  
  // Password reset states
  const [passwordResetStep, setPasswordResetStep] = useState<"email" | "code" | "newPassword" | "success">("email");
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [passwordResetCode, setPasswordResetCode] = useState("");
  
  const navigate = useNavigate();
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }
  const handleVerification = async (code: string) => {
    await verifyOtp(verificationEmail, code);
  };
  const handleResendVerification = async () => {
    await resendOtp(verificationEmail);
  };
  const handlePasswordResetCodeSent = (email: string) => {
    setPasswordResetEmail(email);
    setPasswordResetStep("code");
  };

  const handleCodeVerified = (email: string, code: string) => {
    setPasswordResetEmail(email);
    setPasswordResetCode(code);
    setPasswordResetStep("newPassword");
  };

  const handlePasswordUpdated = () => {
    setPasswordResetStep("success");
    // Auto redirect to login after 3 seconds
    setTimeout(() => {
      resetToLogin();
    }, 3000);
  };

  const handleResendPasswordResetCode = async () => {
    await sendPasswordResetCode(passwordResetEmail);
  };
  const resetToLogin = () => {
    setIsSignUp(false);
    setShowVerification(false);
    setVerificationEmail("");
    setPasswordResetStep("email");
    setPasswordResetEmail("");
    setPasswordResetCode("");
  };
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
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
  const getCardTitle = () => {
    if (showVerification) return "Verify your email";
    if (passwordResetStep === "email") return "Reset Password";
    if (passwordResetStep === "code") return "Enter Code";
    if (passwordResetStep === "newPassword") return "New Password";
    if (passwordResetStep === "success") return "Password Updated!";
    if (isSignUp) return "Create an account";
    return "Welcome back";
  };

  const getCardDescription = () => {
    if (showVerification) return `Enter the 6-digit verification code sent to ${verificationEmail}`;
    if (passwordResetStep === "email") return "Enter your email and we'll send you a verification code";
    if (passwordResetStep === "code") return "Check your email for the 6-digit verification code";
    if (passwordResetStep === "newPassword") return "Choose a new secure password for your account";
    if (passwordResetStep === "success") return "Your password has been updated successfully!";
    if (isSignUp) return "Sign up to start managing your expenses";
    return "Sign in to your account";
  };
  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div 
            key={showVerification ? "verification" : passwordResetStep !== "email" ? `reset-${passwordResetStep}` : isSignUp ? "signup" : "login"} 
            initial="hidden" 
            animate="visible" 
            exit="exit" 
            variants={cardVariants} 
            className="w-full"
          >
            <Card className="border-0 shadow-2xl backdrop-blur-sm bg-card/95 overflow-hidden">
              {/* Card Header */}
              <CardHeader className="space-y-4 text-center pb-6 pt-8 px-8">
                <motion.div initial={{
                opacity: 0,
                scale: 0.9
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                duration: 0.5
              }} className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 ring-8 ring-primary/5">
                  <User className="h-8 w-8 text-primary" />
                </motion.div>

                <div className="space-y-2">
                  <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {getCardTitle()}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {getCardDescription()}
                  </CardDescription>
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="px-8 pb-8">
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
                ) : passwordResetStep === "email" ? (
                  <ForgotPasswordForm 
                    onBackToLogin={resetToLogin} 
                    onCodeSent={handlePasswordResetCodeSent} 
                  />
                ) : passwordResetStep === "code" ? (
                  <PasswordResetCodeForm
                    email={passwordResetEmail}
                    onCodeVerified={handleCodeVerified}
                    onBackToEmail={() => setPasswordResetStep("email")}
                    onResendCode={handleResendPasswordResetCode}
                  />
                ) : passwordResetStep === "newPassword" ? (
                  <SetNewPasswordForm
                    email={passwordResetEmail}
                    code={passwordResetCode}
                    onPasswordUpdated={handlePasswordUpdated}
                    onBack={() => setPasswordResetStep("code")}
                  />
                ) : passwordResetStep === "success" ? (
                  <div className="text-center space-y-4">
                    <div className="text-primary text-6xl">✓</div>
                    <p className="text-muted-foreground">
                      Redirecting you to login...
                    </p>
                  </div>
                ) : isSignUp ? (
                  <SignUpForm 
                    onLoginClick={() => setIsSignUp(false)} 
                    onSignUpSuccess={email => {
                      setVerificationEmail(email);
                      setShowVerification(true);
                    }} 
                  />
                ) : (
                  <LoginForm 
                    onForgotPassword={() => setPasswordResetStep("email")} 
                    onSignUpClick={() => setIsSignUp(true)} 
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Footer text */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.5
      }} className="text-center mt-8">
          <p className="text-sm text-muted-foreground">Secure authentication powered by Quintessentia</p>
        </motion.div>
      </div>
    </div>;
};
export default Auth;
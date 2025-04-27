
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Key, User, AlertCircle, ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useIsMobile } from "@/hooks/use-mobile";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().min(2, "Please enter your full name"),
});

const Auth = () => {
  const { user, signInWithEmail, signInWithGoogle, signUp, verifyOtp, resendOtp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  useEffect(() => {
    if (verificationError && verificationCode) {
      setVerificationError("");
    }
  }, [verificationCode]);

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleGoBack = () => {
    navigate('/');
  };

  const handleLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      // Error is handled in the signInWithEmail function
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setLoading(true);
    try {
      const result = await signUp(values.email, values.password, values.fullName);
      if (result?.email) {
        setVerificationEmail(result.email);
        setShowVerification(true);
        setVerificationError("");
        setVerificationSuccess(false);
      }
    } catch (error) {
      // Error is handled in the signUp function
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    setVerificationError("");
    
    try {
      await verifyOtp(verificationEmail, verificationCode);
      setVerificationSuccess(true);
    } catch (error: any) {
      setVerificationError(error.message || "Verification failed. Please try again.");
      setVerificationSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    try {
      await resendOtp(verificationEmail);
      
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // Error is handled in the resendOtp function
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
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

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.3
      }
    })
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
        {showVerification ? (
          <motion.div
            key="verification"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            className="w-full max-w-md"
          >
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Verify your email</CardTitle>
                <CardDescription>
                  Enter the 6-digit verification code sent to <span className="font-medium">{verificationEmail}</span>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleVerifySubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="flex justify-center pt-2">
                      <InputOTP 
                        maxLength={6} 
                        value={verificationCode} 
                        onChange={setVerificationCode}
                        render={({ slots }) => (
                          <InputOTPGroup>
                            {slots.map((slot, index) => (
                              <InputOTPSlot key={index} {...slot} index={index} />
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                    
                    {verificationError && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex p-3 mt-2 rounded-md bg-destructive/10 text-destructive items-start gap-3"
                      >
                        <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{verificationError}</p>
                      </motion.div>
                    )}
                    
                    {verificationSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex p-3 mt-2 rounded-md bg-primary/10 text-primary items-start gap-3"
                      >
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Verification successful! Redirecting you to dashboard...</p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || verificationSuccess || !verificationCode || verificationCode.length !== 6}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleResendCode}
                    disabled={resendLoading || resendCooldown > 0}
                  >
                    {resendLoading ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend code ({resendCooldown}s)</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend code</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode("");
                      setVerificationError("");
                    }}
                  >
                    Back to login
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        ) : showForgotPassword ? (
          <motion.div
            key="forgot-password"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            className="w-full max-w-md"
          >
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {resetSent && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex p-3 rounded-md bg-primary/10 text-primary items-start gap-3"
                    >
                      <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        If an account exists with this email, you'll receive a password reset link shortly.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={loading || resetSent}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                      setResetSent(false);
                    }}
                  >
                    Back to login
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="auth-form"
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
                <CardTitle className="text-center text-xl md:text-2xl">{isSignUp ? "Create an account" : "Welcome back"}</CardTitle>
                <CardDescription className="text-center">
                  {isSignUp
                    ? "Sign up to start managing your expenses"
                    : "Sign in to your account"}
                </CardDescription>
              </CardHeader>
              
              {isSignUp ? (
                <form onSubmit={signUpForm.handleSubmit(handleSignUpSubmit)}>
                  <CardContent className="space-y-4">
                    <motion.div
                      variants={inputVariants}
                      custom={0}
                      className="space-y-2"
                    >
                      <FormField
                        control={signUpForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  className="pl-10"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div 
                      variants={inputVariants} 
                      custom={1}
                    >
                      <FormField
                        control={signUpForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  className="pl-10"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                    
                    <motion.div 
                      variants={inputVariants} 
                      custom={2}
                    >
                      <FormField
                        control={signUpForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="pl-10"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        "Sign up"
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full relative overflow-hidden group"
                      onClick={() => signInWithGoogle()}
                      disabled={loading}
                    >
                      <span className="absolute inset-0 w-0 bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-[400ms] ease-out group-hover:w-full"></span>
                      <span className="relative flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Continue with Google
                      </span>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={() => {
                        setIsSignUp(false);
                        signUpForm.reset();
                        loginForm.reset();
                      }}
                    >
                      Already have an account? Sign in
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <motion.div 
                      variants={inputVariants} 
                      custom={0}
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  className="pl-10"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                    
                    <motion.div 
                      variants={inputVariants} 
                      custom={1}
                    >
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="pl-10"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <div className="text-right">
                              <Button 
                                type="button" 
                                variant="link" 
                                className="text-xs p-0 h-auto"
                                onClick={() => setShowForgotPassword(true)}
                              >
                                Forgot password?
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full relative overflow-hidden group"
                      onClick={() => signInWithGoogle()}
                      disabled={loading}
                    >
                      <span className="absolute inset-0 w-0 bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-[400ms] ease-out group-hover:w-full"></span>
                      <span className="relative flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Continue with Google
                      </span>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={() => {
                        setIsSignUp(true);
                        loginForm.reset();
                        signUpForm.reset();
                      }}
                    >
                      Don't have an account? Sign up
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;

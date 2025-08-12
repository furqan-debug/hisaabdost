
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useSecurityMonitoring } from '@/hooks/auth/useSecurityMonitoring';

interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ email: string } | undefined>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<void>;
  securityMonitoring: {
    logSecurityEvent: (eventType: string, details?: Record<string, any>) => Promise<void>;
    checkUnusualAccess: () => Promise<boolean>;
  };
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

interface EnhancedAuthProviderProps {
  children: React.ReactNode;
}

export function EnhancedAuthProvider({ children }: EnhancedAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize security monitoring
  const securityMonitoring = useSecurityMonitoring();

  const signInWithEmail = async (email: string, password: string) => {
    try {
      // Log login attempt
      await securityMonitoring.logSecurityEvent('login_attempt', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Log failed login
        await securityMonitoring.logSecurityEvent('login_failed', { 
          email, 
          error: error.message 
        });
        throw error;
      }

      if (data.user) {
        // Check for unusual access patterns
        const isUnusual = await securityMonitoring.checkUnusualAccess();
        if (isUnusual) {
          await securityMonitoring.logSecurityEvent('unusual_access_detected', { email });
          toast.warning("Unusual login activity detected. Please verify your account security.");
        }

        toast.success("Successfully signed in!");
      }
    } catch (error: any) {
      let errorMessage = "Error signing in";
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please verify your email address first";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await securityMonitoring.logSecurityEvent('signup_attempt', { email });

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (signUpError) {
        await securityMonitoring.logSecurityEvent('signup_failed', { 
          email, 
          error: signUpError.message 
        });
        throw signUpError;
      }

      if (data.user && !data.session) {
        await securityMonitoring.logSecurityEvent('signup_verification_required', { email });
        toast.success("Account created! Please check your email for verification code.");
        return { email };
      }

      if (data.session) {
        await securityMonitoring.logSecurityEvent('signup_successful', { email });
        toast.success("Account created and signed in successfully!");
        return { email };
      }

      return { email };
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await securityMonitoring.logSecurityEvent('logout', { user_id: user?.id });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      await securityMonitoring.logSecurityEvent('otp_verification_attempt', { email });

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup"
      });
      
      if (error) {
        await securityMonitoring.logSecurityEvent('otp_verification_failed', { 
          email, 
          error: error.message 
        });
        throw error;
      }

      if (data.user) {
        await securityMonitoring.logSecurityEvent('otp_verification_successful', { email });
        toast.success("Email verified successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      await securityMonitoring.logSecurityEvent('otp_resend_attempt', { email });

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) {
        if (error.message.includes('rate limit')) {
          toast.warning("Please wait a moment before requesting another code.");
        } else {
          throw error;
        }
      } else {
        await securityMonitoring.logSecurityEvent('otp_resend_successful', { email });
        toast.success("New verification code sent! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification code");
      throw error;
    }
  };

  const sendPasswordResetCode = async (email: string) => {
    try {
      await securityMonitoring.logSecurityEvent('password_reset_request', { email });

      const { data, error } = await supabase.functions.invoke('send-password-reset-code', {
        body: { email }
      });
      
      if (error) {
        if (error.message?.includes('wait a minute')) {
          toast.warning("Too many requests. Please wait a minute before trying again.");
        } else {
          throw error;
        }
      } else if (data?.error) {
        if (data.error.includes('wait a minute')) {
          toast.warning("Too many requests. Please wait a minute before trying again.");
        } else {
          throw new Error(data.error);
        }
      } else {
        await securityMonitoring.logSecurityEvent('password_reset_sent', { email });
        toast.success("Password reset link sent! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error sending password reset link");
      throw error;
    }
  };

  useEffect(() => {
    console.log('🔐 Enhanced AuthProvider: Initializing auth...');
    
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔐 Auth state change:', event, currentSession ? 'session exists' : 'no session');
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);

          // Log auth state changes
          if (event === 'SIGNED_IN' && currentSession?.user) {
            await securityMonitoring.logSecurityEvent('session_started', {
              user_id: currentSession.user.id,
              method: 'auth_state_change'
            });
          } else if (event === 'SIGNED_OUT') {
            await securityMonitoring.logSecurityEvent('session_ended', {
              method: 'auth_state_change'
            });
          }
        }
      }
    );

    const getInitialSession = async () => {
      try {
        console.log('🔐 Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 Error getting session:', error);
        } else {
          console.log('🔐 Initial session:', initialSession ? 'found' : 'none');
        }
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('🔐 Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: EnhancedAuthContextType = {
    user,
    session,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    verifyOtp,
    resendOtp,
    sendPasswordResetCode,
    securityMonitoring,
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
}

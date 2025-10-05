
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ email: string } | undefined>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  resendPhoneOtp: (phone: string) => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<void>;
}

const AUTH_FALLBACK: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  signInWithEmail: async () => { throw new Error('AuthProvider not mounted'); },
  signInWithPhone: async () => { throw new Error('AuthProvider not mounted'); },
  signInWithGoogle: async () => { throw new Error('AuthProvider not mounted'); },
  signUp: async () => { throw new Error('AuthProvider not mounted'); },
  signOut: async () => { throw new Error('AuthProvider not mounted'); },
  verifyOtp: async () => { throw new Error('AuthProvider not mounted'); },
  verifyPhoneOtp: async () => { throw new Error('AuthProvider not mounted'); },
  resendOtp: async () => { throw new Error('AuthProvider not mounted'); },
  resendPhoneOtp: async () => { throw new Error('AuthProvider not mounted'); },
  sendPasswordResetCode: async () => { throw new Error('AuthProvider not mounted'); },
};

const AuthContext = createContext<AuthContextType>(AUTH_FALLBACK);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    if (import.meta.env.DEV) {
      console.warn('useAuth called outside AuthProvider - returning fallback context');
    }
    const fallback: AuthContextType = {
      user: null,
      session: null,
      loading: true,
      signInWithEmail: async () => { throw new Error('AuthProvider not mounted'); },
      signInWithPhone: async () => { throw new Error('AuthProvider not mounted'); },
      signInWithGoogle: async () => { throw new Error('AuthProvider not mounted'); },
      signUp: async () => { throw new Error('AuthProvider not mounted'); },
      signOut: async () => { throw new Error('AuthProvider not mounted'); },
      verifyOtp: async () => { throw new Error('AuthProvider not mounted'); },
      verifyPhoneOtp: async () => { throw new Error('AuthProvider not mounted'); },
      resendOtp: async () => { throw new Error('AuthProvider not mounted'); },
      resendPhoneOtp: async () => { throw new Error('AuthProvider not mounted'); },
      sendPasswordResetCode: async () => { throw new Error('AuthProvider not mounted'); },
    };
    return fallback;
  }
  return context;
};

// Optional variant for components that can render outside AuthProvider during boot
export const useAuthOptional = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth methods implemented directly
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (data.user) {
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

  const signInWithPhone = async (phone: string) => {
    try {
      console.log("Attempting phone sign in for:", phone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      
      if (error) {
        console.error("Phone sign in error:", error);
        throw error;
      }
      
      console.log("OTP sent successfully to:", phone);
    } catch (error: any) {
      console.error("Phone sign in error:", error);
      
      let errorMessage = "Error sending OTP";
      if (error.message.includes('Invalid phone number')) {
        errorMessage = "Invalid phone number format";
      } else if (error.message.includes('Unable to send SMS')) {
        errorMessage = "Unable to send SMS. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log("🟢 =============== GOOGLE SIGN-IN START ===============");
    console.log("🟢 Timestamp:", new Date().toISOString());
    
    try {
      console.log("🟢 Step 1: Importing GoogleAuth module...");
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      console.log("🟢 Step 1: SUCCESS - GoogleAuth module imported");
      
      console.log("🟢 Step 2: Initializing Google Auth...");
      console.log("🟢 Web Client ID: 598613920296-nmbbtfptlidjgkg1mq9t6akhqcsf7d4p");
      
      try {
        await GoogleAuth.initialize({
          clientId: '598613920296-nmbbtfptlidjgkg1mq9t6akhqcsf7d4p.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
        console.log("🟢 Step 2: SUCCESS - Google Auth initialized");
      } catch (initError: any) {
        console.error("🔴 Step 2: FAILED - Initialization error");
        console.error("🔴 Init error:", initError);
        throw initError;
      }

      console.log("🟢 Step 3: Triggering native Google Sign-In dialog...");
      let googleUser;
      try {
        googleUser = await GoogleAuth.signIn();
        console.log("🟢 Step 3: SUCCESS - User signed in with Google");
        console.log("🟢 User email:", googleUser.email);
        console.log("🟢 User name:", googleUser.name);
        console.log("🟢 Has ID token:", !!googleUser.authentication?.idToken);
        console.log("🟢 ID token preview:", googleUser.authentication?.idToken?.substring(0, 50) + "...");
      } catch (signInError: any) {
        console.error("🔴 Step 3: FAILED - Sign-in dialog error");
        console.error("🔴 Sign-in error:", signInError);
        throw signInError;
      }
      
      console.log("🟢 Step 4: Exchanging Google token with Supabase...");

      // Exchange Google ID token with Supabase
      let data, error;
      try {
        const response = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: googleUser.authentication.idToken,
        });
        data = response.data;
        error = response.error;
        
        if (error) {
          console.error("🔴 Step 4: FAILED - Supabase token exchange error");
          console.error("🔴 Supabase error:", error);
          throw error;
        }
        console.log("🟢 Step 4: SUCCESS - Token exchanged with Supabase");
      } catch (exchangeError: any) {
        console.error("🔴 Step 4: FAILED - Exception during token exchange");
        console.error("🔴 Exchange error:", exchangeError);
        throw exchangeError;
      }

      if (data.user) {
        console.log("🟢 Step 5: SUCCESS - User authenticated!");
        console.log("🟢 User ID:", data.user.id);
        console.log("🟢 User email:", data.user.email);
        console.log("🟢 =============== GOOGLE SIGN-IN COMPLETE ===============");
        toast.success("Successfully signed in with Google!");
      }
    } catch (error: any) {
      console.error("🔴 ==================== GOOGLE SIGN-IN ERROR ====================");
      console.error("🔴 Timestamp:", new Date().toISOString());
      console.error("🔴 Error type:", typeof error);
      console.error("🔴 Error constructor:", error?.constructor?.name);
      console.error("🔴 Error code:", error?.code);
      console.error("🔴 Error message:", error?.message);
      console.error("🔴 Error stack:", error?.stack);
      
      // Try to stringify the full error object
      try {
        console.error("🔴 Full error (stringified):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      } catch (stringifyError) {
        console.error("🔴 Could not stringify error:", stringifyError);
      }
      
      console.error("🔴 ===============================================================");
      
      let errorMessage = "Failed to sign in with Google";
      
      if (error.message?.includes('popup_closed_by_user') || error.message?.includes('canceled')) {
        errorMessage = "Sign in cancelled";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === '10' || error.message?.includes('10:')) {
        errorMessage = "Google Sign-In not configured. Please check SHA-1 certificate and Android OAuth client in Google Cloud Console.";
      } else if (error.code === '12500' || error.message?.includes('12500')) {
        errorMessage = "Configuration error. Please verify package name and SHA-1 certificate match in Google Cloud Console.";
      } else if (error.message) {
        errorMessage = `${error.message} (Code: ${error.code || 'unknown'})`;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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
      
      if (signUpError) throw signUpError;

      if (data.user && !data.session) {
        toast.success("Account created! Please check your email for verification code.");
        return { email };
      }

      if (data.session) {
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup"
      });
      
      if (error) throw error;
      if (data.user) {
        toast.success("Email verified successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
      throw error;
    }
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    try {
      console.log("Verifying phone OTP for:", phone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      
      if (error) {
        console.error("Phone OTP verification error:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("Phone OTP verification successful for user:", data.user.id);
        toast.success("Phone verified successfully!");
      }
    } catch (error: any) {
      console.error("Phone OTP verification error:", error);
      
      let errorMessage = "Invalid verification code";
      if (error.message.includes('expired')) {
        errorMessage = "Verification code has expired";
      } else if (error.message.includes('invalid')) {
        errorMessage = "Invalid verification code";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
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
        toast.success("New verification code sent! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification code");
      throw error;
    }
  };

  const resendPhoneOtp = async (phone: string) => {
    try {
      console.log("Resending phone OTP to:", phone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      
      if (error) {
        console.error("Resend phone OTP error:", error);
        throw error;
      }
      
      console.log("Phone OTP resent successfully");
    } catch (error: any) {
      console.error("Resend phone OTP error:", error);
      toast.error(error.message || "Failed to resend verification code");
      throw error;
    }
  };

  const sendPasswordResetCode = async (email: string) => {
    try {
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
        toast.success("Password reset link sent! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error sending password reset link");
      throw error;
    }
  };

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth...');
    
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('🔐 Auth state change:', event, currentSession ? 'session exists' : 'no session');
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      }
    );

    // Get initial session
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

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithEmail,
    signInWithPhone,
    signInWithGoogle,
    signUp,
    signOut,
    verifyOtp,
    verifyPhoneOtp,
    resendOtp,
    resendPhoneOtp,
    sendPasswordResetCode,
  };

  console.log('🔐 AuthProvider rendering with state:', {
    loading,
    hasUser: !!user,
    hasSession: !!session
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

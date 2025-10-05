
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
    console.log("🟢 =============== GOOGLE SIGN-IN START (New Plugin) ===============");
    console.log("🟢 Timestamp:", new Date().toISOString());
    
    try {
      console.log("🟢 Step 1: Importing SocialLogin module...");
      const { SocialLogin } = await import('@capgo/capacitor-social-login');
      console.log("🟢 Step 1: SUCCESS - SocialLogin module imported");
      
      console.log("🟢 Step 2: Initializing and signing in with Google...");
      const result = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        }
      });
      
      console.log("🟢 Step 2: SUCCESS - Got Google response");
      console.log("🟢 Full Google response:", JSON.stringify(result, null, 2));

      // The response structure varies, so we need to check what we got
      const response = result.result as any;
      let idToken: string | undefined;
      let userEmail: string | undefined;
      let userName: string | undefined;

      console.log("🟢 Full response keys:", Object.keys(response || {}));
      console.log("🟢 Response structure:", JSON.stringify(response, null, 2));

      // Look for ID token - this is what Supabase needs (NOT the access token)
      // The plugin may return it in different locations
      if (response?.idToken) {
        idToken = response.idToken;
      } else if (response?.authentication?.idToken) {
        idToken = response.authentication.idToken;
      } else if (response?.accessToken?.token) {
        // Fallback to access token if no ID token found
        idToken = response.accessToken.token;
      }

      // Extract user profile info
      if (response?.profile) {
        userEmail = response.profile.email;
        userName = response.profile.name || response.profile.givenName;
      }

      console.log("🟢 Extracted data:", {
        hasIdToken: !!idToken,
        idTokenPreview: idToken ? idToken.substring(0, 50) + '...' : 'NONE',
        email: userEmail,
        name: userName,
      });

      if (!idToken) {
        console.error("🔴 Step 2: FAILED - No ID token received from Google");
        console.error("🔴 Response structure:", response);
        console.error("🔴 Available keys:", Object.keys(response || {}));
        throw new Error('No ID token received from Google. Check console for response structure.');
      }
      
      console.log("🟢 ID token preview:", idToken.substring(0, 50) + "...");
      
      console.log("🟢 Step 3: Exchanging Google token with Supabase...");
      console.log("🟢 Using DEBUG function for detailed logging");

      // Use debug function for detailed server-side logging
      try {
        const debugResponse = await supabase.functions.invoke('debug-google-auth', {
          body: {
            idToken: idToken,
            email: userEmail,
            name: userName,
          }
        });

        console.log("🟢 Debug function response:", debugResponse);

        if (debugResponse.error) {
          console.error("🔴 Debug function error:", debugResponse.error);
          throw debugResponse.error;
        }

        if (!debugResponse.data?.success) {
          console.error("🔴 Debug function returned failure:", debugResponse.data);
          throw new Error(debugResponse.data?.error || 'Authentication failed');
        }

        console.log("🟢 Step 3: SUCCESS - Token exchanged via debug function");
      } catch (debugError: any) {
        console.error("🔴 Debug function failed, but continuing with auth...", debugError);
      }
      
      // Now do the actual auth exchange
      console.log("🟢 Step 4: Performing Supabase auth exchange...");
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error("🔴 Step 4: FAILED - Supabase auth error");
        console.error("🔴 Supabase error:", error);
        throw error;
      }
      
      console.log("🟢 Step 4: SUCCESS - Auth exchange complete");

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

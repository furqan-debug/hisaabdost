
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ email: string } | undefined>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        // Check onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          setShowOnboarding(true);
        }

        // Update last login timestamp
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id);

        // Redirect if on auth page
        if (location.pathname === "/auth") {
          navigate("/app/dashboard");
        }
      }

      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          setShowOnboarding(true);
        }

        if (location.pathname === "/auth") {
          navigate("/app/dashboard");
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      toast.success("Successfully signed in!");
      navigate("/app/dashboard");
    } catch (error: any) {
      uiToast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message,
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error("Google auth error:", error);
        throw error;
      }
      
      uiToast({
        title: "Redirecting to Google...",
        description: "Please wait while we redirect you to Google for authentication.",
      });
    } catch (error: any) {
      console.error("Google auth error:", error);
      uiToast({
        variant: "destructive",
        title: "Error signing in with Google",
        description: error.message,
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Use OTP for sign up instead of email confirmation link
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // Don't redirect to any URL since we're using OTP verification
          emailRedirectTo: undefined,
        },
      });
      
      if (error) throw error;
      
      toast.success("Verification code sent! Please check your email.");
      return { email };
    } catch (error: any) {
      uiToast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message,
      });
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup"
      });
      
      if (error) throw error;
      
      toast.success("Email verified successfully!");
      navigate("/app/dashboard");
    } catch (error: any) {
      uiToast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      });
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast.success("New verification code sent! Please check your email.");
    } catch (error: any) {
      uiToast({
        variant: "destructive",
        title: "Error sending verification code",
        description: error.message,
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      uiToast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signInWithGoogle, signUp, verifyOtp, resendOtp, signOut }}>
      {children}
      {showOnboarding && user && (
        <OnboardingDialog open={showOnboarding} />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

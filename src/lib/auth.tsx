
import React, { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { useEmailAuth } from "@/hooks/auth/useEmailAuth";
import { useVerification } from "@/hooks/auth/useVerification";
import { useSocialAuth } from "@/hooks/auth/useSocialAuth";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useOnboarding } from "@/hooks/auth/useOnboarding";
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
  const { user, loading, session } = useAuthSession();
  const { signInWithEmail, signUp } = useEmailAuth();
  const { verifyOtp, resendOtp } = useVerification();
  const { signInWithGoogle } = useSocialAuth();
  const { signOut } = useSignOut();
  const { showOnboarding } = useOnboarding(user);

  return (
    <AuthContext.Provider value={{ 
      user,
      loading,
      signInWithEmail,
      signInWithGoogle,
      signUp,
      verifyOtp,
      resendOtp,
      signOut,
    }}>
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

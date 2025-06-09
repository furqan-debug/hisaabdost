
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { useEmailAuth } from "@/hooks/auth/useEmailAuth";
import { useVerification } from "@/hooks/auth/useVerification";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useOnboarding } from "@/hooks/auth/useOnboarding";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ email: string } | undefined>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<void>;
  verifyPasswordResetCode: (email: string, token: string) => Promise<void>;
  verifyPasswordResetToken: (email: string, token: string) => Promise<void>;
  updatePassword: (email: string, code: string, newPassword: string) => Promise<void>;
};

// Create the context with a default value that won't be used
// but satisfies TypeScript requirements
const initialContextValue: AuthContextType = {
  user: null,
  loading: true,
  signInWithEmail: async () => { throw new Error("AuthContext not initialized"); },
  signUp: async () => { throw new Error("AuthContext not initialized"); },
  verifyOtp: async () => { throw new Error("AuthContext not initialized"); },
  resendOtp: async () => { throw new Error("AuthContext not initialized"); },
  signOut: async () => { throw new Error("AuthContext not initialized"); },
  sendPasswordResetCode: async () => { throw new Error("AuthContext not initialized"); },
  verifyPasswordResetCode: async () => { throw new Error("AuthContext not initialized"); },
  verifyPasswordResetToken: async () => { throw new Error("AuthContext not initialized"); },
  updatePassword: async () => { throw new Error("AuthContext not initialized"); },
};

const AuthContext = createContext<AuthContextType>(initialContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Log the component render
  console.log("AuthProvider rendering");
  
  const { user, loading, session } = useAuthSession();
  const { signInWithEmail, signUp } = useEmailAuth();
  const { verifyOtp, resendOtp } = useVerification();
  const { signOut } = useSignOut();
  const { showOnboarding } = useOnboarding(user);
  const { sendPasswordResetCode, verifyPasswordResetCode, verifyPasswordResetToken, updatePassword } = usePasswordReset();

  const contextValue: AuthContextType = {
    user,
    loading,
    signInWithEmail,
    signUp,
    verifyOtp,
    resendOtp,
    signOut,
    sendPasswordResetCode,
    verifyPasswordResetCode,
    verifyPasswordResetToken,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {showOnboarding && user && (
        <OnboardingDialog open={showOnboarding} />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

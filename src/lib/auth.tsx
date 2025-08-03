
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useEmailAuth } from '@/hooks/auth/useEmailAuth';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useVerification } from '@/hooks/auth/useVerification';
import { usePasswordReset } from '@/hooks/auth/usePasswordReset';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ email: string }>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { signInWithEmail, signUp } = useEmailAuth();
  const { signOut } = useSignOut();
  const { verifyOtp, resendOtp } = useVerification();
  const { sendPasswordResetCode } = usePasswordReset();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      signInWithEmail,
      signUp,
      signOut,
      verifyOtp,
      resendOtp,
      sendPasswordResetCode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

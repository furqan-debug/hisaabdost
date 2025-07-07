
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSignIn } from '@/hooks/auth/useSignIn';
import { useSignUp } from '@/hooks/auth/useSignUp';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useVerification } from '@/hooks/auth/useVerification';
import { usePasswordReset } from '@/hooks/auth/usePasswordReset';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ email: string } | undefined>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithEmail: async () => {},
  signUp: async () => undefined,
  signOut: async () => {},
  verifyOtp: async () => {},
  resendOtp: async () => {},
  sendPasswordResetCode: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Import auth methods from hooks
  const { signInWithEmail } = useSignIn();
  const { signUp } = useSignUp();
  const { signOut } = useSignOut();
  const { verifyOtp, resendOtp } = useVerification();
  const { sendPasswordResetCode } = usePasswordReset();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 Error getting session:', error);
        } else {
          console.log('🔐 Initial session:', session ? 'found' : 'none');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('🔐 Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session ? 'session exists' : 'no session');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    verifyOtp,
    resendOtp,
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

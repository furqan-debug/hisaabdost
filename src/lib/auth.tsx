
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

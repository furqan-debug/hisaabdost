
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Local storage key for cached user state
const USER_CACHE_KEY = "hisaabdost_user_cache";

// Cache user info to avoid blank screens during loading
const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (!cached) return null;
    
    return JSON.parse(cached);
  } catch (e) {
    console.error('Error reading cached user:', e);
    return null;
  }
};

const setCachedUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch (e) {
    console.error('Error caching user:', e);
  }
};

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(getCachedUser());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔐 Setting up auth session listener");
    let mounted = true;
    
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log("🔐 Getting initial session...");
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error("❌ Error getting initial session:", error);
        } else {
          console.log("✅ Initial session retrieved:", !!session?.user);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setCachedUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Error in getInitialSession:", error);
        if (mounted) {
          // Don't block the app - set loading to false even on error
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("🔐 Auth state change:", event, !!currentSession?.user);
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setCachedUser(currentSession?.user ?? null);
          
          // Update user profile in background if user exists
          if (currentSession?.user) {
            setTimeout(async () => {
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', currentSession.user.id)
                  .single();
                  
                if (!profileError) {
                  // Update last login
                  await supabase
                    .from('profiles')
                    .update({ 
                      last_login_at: new Date().toISOString(),
                      ...(currentSession.user.user_metadata?.full_name && !profileData.full_name ? 
                        { full_name: currentSession.user.user_metadata.full_name } : {})
                    })
                    .eq('id', currentSession.user.id);
                }
              } catch (err) {
                console.error("Background profile update failed:", err);
              }
            }, 2000);
          }
        }
      }
    );

    // Get initial session
    getInitialSession();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  console.log("🔐 Auth state:", { loading, hasUser: !!user, hasSession: !!session });

  return {
    user,
    session,
    loading
  };
};

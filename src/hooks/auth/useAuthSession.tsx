
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
    // Ignore storage errors
  }
};

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(getCachedUser());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth session listener");
    let subscription: { unsubscribe: () => void } | null = null;
    
    // Check for session immediately using cache-first approach
    const initAuth = async () => {
      try {
        // First set up auth state listener
        const { data } = await supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state change:", event);
          const currentUser = currentSession?.user ?? null;
          
          setUser(currentUser);
          setSession(currentSession);
          setCachedUser(currentUser);

          if (currentUser) {
            try {
              // Perform user profile updates in the background instead of blocking
              setTimeout(async () => {
                try {
                  // Update last login timestamp and sync user metadata with profiles
                  const { data: profileData, error: profileCheckError } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', currentUser.id)
                    .single();
                    
                  if (!profileCheckError) {
                    // Profile exists, update it
                    await supabase
                      .from('profiles')
                      .update({ 
                        last_login_at: new Date().toISOString(),
                        // Update profile full_name with user_metadata if available and profile name is empty
                        ...(currentUser.user_metadata?.full_name && !profileData.full_name ? 
                          { full_name: currentUser.user_metadata.full_name } : {})
                      })
                      .eq('id', currentUser.id);
                  }
                } catch (err) {
                  console.error("Background profile update failed:", err);
                }
              }, 2000); // Delay by 2 seconds to prioritize UI loading
            } catch (error) {
              console.error("Error in background tasks:", error);
            }
          }
        });
        
        subscription = data.subscription;

        // Now check for existing session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        const currentUser = sessionData.session?.user ?? null;
        setUser(currentUser);
        setCachedUser(currentUser);
        
        // Only mark loading as complete after session check
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Return cleanup function to unsubscribe
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return {
    user,
    session,
    loading
  };
};

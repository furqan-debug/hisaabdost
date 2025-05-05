
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/clientOptimized";
import { useNavigate } from "react-router-dom";

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
  const [loading, setLoading] = useState(!user);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for session immediately using cache-first approach
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        const newUser = session?.user ?? null;
        setUser(newUser);
        setCachedUser(newUser);
        
        // Only mark loading as complete after session check
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };
    
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);
      const user = session?.user ?? null;
      
      setUser(user);
      setSession(session);
      setCachedUser(user);

      if (user) {
        try {
          // Perform user profile updates in the background instead of blocking
          setTimeout(async () => {
            try {
              // Update last login timestamp and sync user metadata with profiles
              const { data: profileData, error: profileCheckError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
                
              if (!profileCheckError) {
                // Profile exists, update it
                await supabase
                  .from('profiles')
                  .update({ 
                    last_login_at: new Date().toISOString(),
                    // Update profile full_name with user_metadata if available and profile name is empty
                    ...(user.user_metadata?.full_name && !profileData.full_name ? 
                      { full_name: user.user_metadata.full_name } : {})
                  })
                  .eq('id', user.id);
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

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    user,
    session,
    loading
  };
};

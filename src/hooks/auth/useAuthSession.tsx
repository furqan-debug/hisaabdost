
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setUser(user);
      setSession(session);

      if (user) {
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
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return {
    user,
    session,
    loading
  };
};

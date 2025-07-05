
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useOnboarding = (user: User | null) => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        console.log("Checking onboarding status for user:", user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error checking onboarding status:", error);
          setShowOnboarding(false);
          return;
        }

        console.log("Profile onboarding status:", profile?.onboarding_completed);
        
        if (profile && !profile.onboarding_completed) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } else {
        setShowOnboarding(false);
      }
    };

    checkOnboardingStatus();

    // Set up real-time subscription to listen for onboarding completion
    const channel = supabase
      .channel('onboarding-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`,
        },
        (payload) => {
          console.log("Profile update received:", payload);
          if (payload.new.onboarding_completed) {
            console.log("Onboarding completed, hiding dialog");
            setShowOnboarding(false);
            
            // Additional navigation fallback for mobile
            setTimeout(() => {
              if (window.location.pathname !== "/app/dashboard") {
                console.log("Fallback navigation to dashboard");
                window.location.href = "/app/dashboard";
              }
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { showOnboarding };
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export const useOnboarding = (user: User | null) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
          // If user completed onboarding but is not on dashboard, redirect
          if (profile?.onboarding_completed && window.location.pathname !== '/app/dashboard') {
            console.log("User completed onboarding, redirecting to dashboard");
            navigate("/app/dashboard", { replace: true });
          }
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
          if (payload.new.onboarding_completed) {
            console.log("Onboarding completed via real-time update");
            setShowOnboarding(false);
            // Force navigation when onboarding is completed
            setTimeout(() => {
              navigate("/app/dashboard", { replace: true });
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  return { showOnboarding };
};

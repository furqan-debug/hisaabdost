
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useOnboarding = (user: User | null) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, full_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (!profile.onboarding_completed) {
            setShowOnboarding(true);
          }
          setFullName(profile.full_name || null);
        }
      }
    };

    checkOnboardingStatus();
  }, [user]);

  return { showOnboarding, fullName };
};

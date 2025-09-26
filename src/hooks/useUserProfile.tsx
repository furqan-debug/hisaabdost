import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Helper function to get display name
  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email;
    }
    if (user?.phone) {
      return user.phone;
    }
    return "User";
  };

  // Helper function to get username
  const getUsername = () => {
    if (profile?.full_name) {
      return profile.full_name.toLowerCase().replace(/\s+/g, '');
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    if (user?.phone) {
      return user.phone.replace(/[^\d]/g, '').slice(-4); // Last 4 digits
    }
    return "user";
  };

  return {
    profile,
    loading,
    getDisplayName,
    getUsername
  };
};
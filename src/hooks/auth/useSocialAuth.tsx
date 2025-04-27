
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSocialAuth = () => {
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Google auth error:", error);
        throw error;
      }
      
      toast.info("Redirecting to Google...");
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast.error(error.message || "Error signing in with Google");
    }
  };

  return {
    signInWithGoogle,
  };
};

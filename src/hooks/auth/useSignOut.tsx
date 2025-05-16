
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useFinny } from "@/components/finny";

export const useSignOut = () => {
  const navigate = useNavigate();
  let resetChat = () => {}; // Default empty function
  
  // Safely try to get resetChat function
  try {
    const finny = useFinny();
    if (finny && typeof finny.resetChat === 'function') {
      resetChat = finny.resetChat;
    }
  } catch (error) {
    console.error("Error accessing Finny context:", error);
    // Continue with empty resetChat function
  }

  const signOut = async () => {
    try {
      // Show loading toast
      const toastId = toast.loading("Signing out...");
      
      // Try to clear Finny chat before signing out
      try {
        if (typeof resetChat === 'function') {
          resetChat();
        }
        localStorage.removeItem('finny_chat_messages');
      } catch (error) {
        console.error("Error resetting chat:", error);
      }
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      toast.success("Successfully signed out");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };

  return {
    signOut,
  };
};

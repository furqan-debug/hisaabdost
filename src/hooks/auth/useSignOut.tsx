
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useFinny } from "@/components/finny/FinnyProvider";

export const useSignOut = () => {
  const navigate = useNavigate();
  const { resetChat } = useFinny();

  const signOut = async () => {
    try {
      // Reset Finny chat state before signing out
      resetChat();
      
      // Clear local storage items related to app state
      localStorage.removeItem('monthsData');
      localStorage.removeItem('currency');
      localStorage.removeItem('theme');
      localStorage.removeItem('finny_chat_messages');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Successfully signed out");
      navigate("/auth");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Error signing out");
    }
  };

  return {
    signOut,
  };
};

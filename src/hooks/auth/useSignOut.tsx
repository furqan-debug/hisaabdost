
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useFinny } from "@/components/finny/FinnyProvider";

export const useSignOut = () => {
  const navigate = useNavigate();
  const { resetChat } = useFinny();

  const signOut = async () => {
    try {
      // Clear Finny chat before signing out
      resetChat();
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage of any user data
      localStorage.removeItem('finny_chat_messages');
      
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

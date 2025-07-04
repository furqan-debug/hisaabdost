
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSignOut = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      console.log("🔓 Starting sign out process");
      
      // Clear Finny chat context safely
      try {
        const { useFinny } = await import("@/components/finny/context/FinnyContext");
        const { clearChatHistory } = useFinny();
        clearChatHistory();
        console.log("Finny chat history cleared");
      } catch (finnyError) {
        console.log("Finny context not available during sign out, skipping cleanup");
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Error signing out");
        throw error;
      }

      console.log("🔓 Sign out successful");
      toast.success("Signed out successfully");
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
      // Navigate anyway to prevent being stuck
      navigate("/auth", { replace: true });
    }
  };

  return { signOut };
};

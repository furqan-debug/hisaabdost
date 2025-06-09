
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePasswordReset = () => {
  const sendPasswordResetCode = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        if (error.status === 429) {
          toast.warning("Too many requests. Please wait a minute before trying again.");
        } else {
          throw error;
        }
      } else {
        toast.success("Password reset code sent! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error sending password reset code");
      throw error;
    }
  };

  const verifyPasswordResetCode = async (email: string, token: string) => {
    try {
      console.log("Verifying password reset code:", email, token);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email"
      });
      
      if (error) {
        console.error("Password reset code verification error:", error);
        throw error;
      }
      
      console.log("Password reset code verified successfully");
    } catch (error: any) {
      console.error("Password reset code verification error:", error);
      toast.error(error.message || "Invalid or expired code");
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
      throw error;
    }
  };

  return {
    sendPasswordResetCode,
    verifyPasswordResetCode,
    updatePassword,
  };
};

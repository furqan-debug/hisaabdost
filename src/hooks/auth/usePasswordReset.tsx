
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePasswordReset = () => {
  const sendPasswordResetCode = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-code', {
        body: { email }
      });
      
      if (error) {
        if (error.message?.includes('wait a minute')) {
          toast.warning("Too many requests. Please wait a minute before trying again.");
        } else {
          throw error;
        }
      } else if (data?.error) {
        if (data.error.includes('wait a minute')) {
          toast.warning("Too many requests. Please wait a minute before trying again.");
        } else {
          throw new Error(data.error);
        }
      } else {
        toast.success("Password reset link sent! Please check your email.");
      }
    } catch (error: any) {
      console.error("Error sending password reset link:", error);
      toast.error(error.message || "Error sending password reset link");
      throw error;
    }
  };

  const verifyPasswordResetToken = async (email: string, token: string) => {
    try {
      console.log("Verifying password reset token:", email, token);
      const { data, error } = await supabase.functions.invoke('verify-reset-code', {
        body: { email, token }
      });
      
      if (error) {
        console.error("Password reset token verification error:", error);
        throw error;
      }

      if (data?.error) {
        console.error("Password reset token verification error:", data.error);
        throw new Error(data.error);
      }
      
      console.log("Password reset token verified successfully");
      return data;
    } catch (error: any) {
      console.error("Password reset token verification error:", error);
      toast.error(error.message || "Invalid or expired reset link");
      throw error;
    }
  };

  const updatePassword = async (email: string, token: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-password-with-code', {
        body: { email, token, newPassword }
      });
      
      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      if (data?.error) {
        console.error("Password update error:", data.error);
        throw new Error(data.error);
      }
      
      toast.success("Password updated successfully!");
      return data;
    } catch (error: any) {
      console.error("Password update error:", error);
      toast.error(error.message || "Failed to update password");
      throw error;
    }
  };

  // Legacy method for backward compatibility
  const verifyPasswordResetCode = verifyPasswordResetToken;

  return {
    sendPasswordResetCode,
    verifyPasswordResetToken,
    verifyPasswordResetCode, // backward compatibility
    updatePassword,
  };
};

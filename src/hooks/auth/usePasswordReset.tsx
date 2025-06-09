
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
        toast.success("Password reset code sent! Please check your email.");
        
        // Show code in development for testing
        if (data?.code) {
          console.log("Reset code (dev only):", data.code);
          toast.info(`Development mode - Code: ${data.code}`);
        }
      }
    } catch (error: any) {
      console.error("Error sending password reset code:", error);
      toast.error(error.message || "Error sending password reset code");
      throw error;
    }
  };

  const verifyPasswordResetCode = async (email: string, code: string) => {
    try {
      console.log("Verifying password reset code:", email, code);
      const { data, error } = await supabase.functions.invoke('verify-reset-code', {
        body: { email, code }
      });
      
      if (error) {
        console.error("Password reset code verification error:", error);
        throw error;
      }

      if (data?.error) {
        console.error("Password reset code verification error:", data.error);
        throw new Error(data.error);
      }
      
      console.log("Password reset code verified successfully");
      return data;
    } catch (error: any) {
      console.error("Password reset code verification error:", error);
      toast.error(error.message || "Invalid or expired code");
      throw error;
    }
  };

  const updatePassword = async (email: string, code: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-password-with-code', {
        body: { email, code, newPassword }
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

  return {
    sendPasswordResetCode,
    verifyPasswordResetCode,
    updatePassword,
  };
};

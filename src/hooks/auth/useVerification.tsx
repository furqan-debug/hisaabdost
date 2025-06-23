
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useVerification = () => {
  const navigate = useNavigate();

  const verifyOtp = async (email: string, token: string) => {
    try {
      console.log("Verifying OTP:", email, token);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup"
      });
      
      if (error) {
        console.error("OTP verification error:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("OTP verification successful");
        toast.success("Email verified successfully!");
        navigate("/app/dashboard");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Verification failed");
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      console.log("Resending OTP to:", email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) {
        if (error.message.includes('rate limit')) {
          toast.warning("Please wait a moment before requesting another code.");
        } else {
          throw error;
        }
      } else {
        toast.success("New verification code sent! Please check your email.");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend verification code");
      throw error;
    }
  };

  return {
    verifyOtp,
    resendOtp,
  };
};

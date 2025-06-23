
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useVerification = () => {
  const navigate = useNavigate();

  const verifyOtp = async (email: string, token: string) => {
    try {
      console.log("Verifying OTP:", email, token);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email"
      });
      
      if (error) {
        console.error("OTP verification error:", error);
        throw error;
      }
      
      toast.success("Email verified successfully!");
      navigate("/app/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
      // Handle specific verification errors
      if (error.message?.includes("Token has expired")) {
        toast.error("Verification code has expired. Please request a new one.");
      } else if (error.message?.includes("Invalid token")) {
        toast.error("Invalid verification code. Please check and try again.");
      } else {
        toast.error(error.message || "Verification failed. Please try again.");
      }
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        if (error.status === 429) {
          toast.warning("Please wait a moment before requesting another verification code.", {
            description: "Rate limiting is in place to prevent spam."
          });
        } else {
          throw error;
        }
      } else {
        toast.success("New verification code sent! Please check your email.");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      
      if (error.status === 429) {
        toast.warning("Please wait a moment before requesting another verification code.");
      } else {
        toast.error(error.message || "Error sending verification code. Please try again.");
      }
      throw error;
    }
  };

  return {
    verifyOtp,
    resendOtp,
  };
};

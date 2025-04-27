
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
      toast.error(error.message || "Verification failed");
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
          toast.warning("Too many requests. Please wait a minute before trying again.");
        } else {
          throw error;
        }
      } else {
        toast.success("New verification code sent! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error sending verification code");
      throw error;
    }
  };

  return {
    verifyOtp,
    resendOtp,
  };
};

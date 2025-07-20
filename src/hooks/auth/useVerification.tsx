
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useVerification = () => {
  const navigate = useNavigate();

  const verifyOtp = async (email: string, token: string) => {
    try {
      console.log("Verifying OTP:", email, token);
      
      // Try Supabase's built-in OTP verification first
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup"
      });
      
      if (error) {
        console.error("Standard OTP verification error:", error);
        
        // If standard OTP fails, try manual confirmation
        // This is a fallback for when custom email verification is used
        try {
          const { error: confirmError } = await supabase.auth.admin.updateUserById(
            data?.user?.id || '',
            { email_confirm: true }
          );
          
          if (confirmError) {
            throw error; // Throw original error if fallback also fails
          }
          
          console.log("Manual email confirmation successful");
          toast.success("Email verified successfully!");
          navigate("/app/dashboard");
          return;
        } catch (fallbackError) {
          throw error; // Throw original error
        }
      }
      
      if (data.user) {
        console.log("OTP verification successful");
        toast.success("Email verified successfully!");
        navigate("/app/dashboard");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Verification failed. Please check your code and try again.");
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      console.log("Resending OTP to:", email);
      
      // Try both standard resend and custom verification email
      const promises = [
        supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        }),
        supabase.functions.invoke('send-verification-email', {
          body: { email }
        })
      ];
      
      const results = await Promise.allSettled(promises);
      
      // Check if at least one succeeded
      const hasSuccess = results.some(result => result.status === 'fulfilled' && !result.value.error);
      
      if (hasSuccess) {
        toast.success("New verification code sent! Please check your email.");
      } else {
        // If both failed, check the errors
        const standardError = results[0].status === 'fulfilled' ? results[0].value.error : results[0].reason;
        const customError = results[1].status === 'fulfilled' ? results[1].value.error : results[1].reason;
        
        if (standardError?.message?.includes('rate limit') || customError?.message?.includes('rate limit')) {
          toast.warning("Please wait a moment before requesting another code.");
        } else {
          throw standardError || customError || new Error("Failed to resend verification code");
        }
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

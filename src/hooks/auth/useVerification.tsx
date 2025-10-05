
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useVerification = () => {
  const navigate = useNavigate();

  const verifyOtp = async (email: string, token: string) => {
    try {
      console.log("Verifying custom verification code for email:", email, "code:", token);
      
      // Use custom verification code system
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: { email, code: token }
      });
      
      if (error) {
        console.error("Custom verification failed:", error);
        throw error;
      }

      if (data?.error) {
        console.error("Verification error:", data.error);
        throw new Error(data.error);
      }
      
      if (data?.valid) {
        console.log("Email verification successful");
        toast.success("Email verified successfully!");
        
        // Now sign in the user with their credentials
        // We need to get their email to sign in - it's already in the email parameter
        // But we don't have their password here, so we'll just redirect and let them sign in
        navigate("/auth");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Verification failed. Please check your code and try again.");
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      console.log("Resending verification code to:", email);
      
      // Try both standard resend and custom verification email
      const standardResendPromise = supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      const customEmailPromise = supabase.functions.invoke('send-verification-email', {
        body: { email }
      });
      
      const results = await Promise.allSettled([standardResendPromise, customEmailPromise]);
      
      // Check results
      const standardResult = results[0];
      const customResult = results[1];
      
      console.log("Standard resend result:", standardResult);
      console.log("Custom email result:", customResult);
      
      let hasSuccess = false;
      let errorMessage = "";
      
      // Check standard resend
      if (standardResult.status === 'fulfilled' && !standardResult.value.error) {
        hasSuccess = true;
      } else if (standardResult.status === 'fulfilled' && standardResult.value.error) {
        console.error("Standard resend error:", standardResult.value.error);
        errorMessage = standardResult.value.error.message || "Failed to resend code";
      }
      
      // Check custom email
      if (customResult.status === 'fulfilled' && customResult.value.data?.success) {
        hasSuccess = true;
      } else if (customResult.status === 'fulfilled' && customResult.value.error) {
        console.error("Custom email error:", customResult.value.error);
        if (!hasSuccess) {
          errorMessage = customResult.value.error.message || "Failed to send verification email";
        }
      }
      
      if (hasSuccess) {
        toast.success("New verification code sent! Please check your email.");
      } else {
        if (errorMessage.includes('rate limit') || errorMessage.includes('wait a minute')) {
          toast.warning("Please wait a moment before requesting another code.");
        } else {
          toast.error(errorMessage || "Failed to resend verification code");
          throw new Error(errorMessage || "Failed to resend verification code");
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

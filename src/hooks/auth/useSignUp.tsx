
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSignUp = () => {
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          }
        });
        
        if (otpError) {
          // If this is a rate limit error, we still want to proceed to verification
          // because the account was created successfully
          if (otpError.status === 429) {
            toast.warning("Verification code may be delayed due to rate limiting. Please wait a moment before requesting a new code.");
            return { email };
          }
          throw otpError;
        }
        
        toast.success("Verification code sent! Please check your email.");
        return { email };
      } catch (otpError: any) {
        // If OTP sending fails but account was created, still redirect to verification
        if (otpError.status === 429) {
          toast.warning("Verification code may be delayed due to rate limiting. Please wait a moment before requesting a new code.");
          return { email };
        }
        console.error("OTP error:", otpError);
        toast.error(otpError.message || "Error sending verification code");
        throw otpError;
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Error signing up");
      throw error;
    }
  };

  return {
    signUp,
  };
};

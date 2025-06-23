
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
      
      // Account created successfully, now try to send verification code
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          }
        });
        
        if (otpError) {
          // Handle rate limiting gracefully
          if (otpError.status === 429) {
            toast.success("Account created successfully!", {
              description: "Verification code will be sent shortly. Please check your email in a few moments."
            });
            return { email };
          }
          
          // For other OTP errors, still proceed since account was created
          console.warn("OTP sending failed:", otpError);
          toast.success("Account created successfully!", {
            description: "Please check your email for the verification code."
          });
          return { email };
        }
        
        toast.success("Account created! Please check your email for the verification code.");
        return { email };
        
      } catch (otpError: any) {
        // If OTP sending fails but account was created, still proceed
        console.warn("OTP error:", otpError);
        toast.success("Account created successfully!", {
          description: "Please check your email for the verification code."
        });
        return { email };
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific signup errors
      if (error.message?.includes("User already registered")) {
        toast.error("An account with this email already exists. Please try signing in instead.");
      } else if (error.message?.includes("Password should be at least")) {
        toast.error("Password must be at least 6 characters long.");
      } else if (error.message?.includes("Invalid email")) {
        toast.error("Please enter a valid email address.");
      } else {
        toast.error(error.message || "Error creating account. Please try again.");
      }
      throw error;
    }
  };

  return {
    signUp,
  };
};


import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useEmailAuth = () => {
  const navigate = useNavigate();

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Successfully signed in!");
      navigate("/app/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Error signing in");
      throw error;
    }
  };

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
      
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (otpError) throw otpError;
      
      toast.success("Verification code sent! Please check your email.");
      return { email };
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Error signing up");
      throw error;
    }
  };

  return {
    signInWithEmail,
    signUp,
  };
};

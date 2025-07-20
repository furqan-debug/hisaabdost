
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSignUp = () => {
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Starting signup process for:", email);
      
      // First, try to sign up the user with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (signUpError) {
        console.error("Signup error:", signUpError);
        throw signUpError;
      }

      console.log("Signup successful, user created:", data.user?.id);

      // Check if user needs confirmation
      if (data.user && !data.session) {
        console.log("User needs email confirmation");
        
        // Send custom verification email
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification-email', {
            body: { email }
          });
          
          if (emailError) {
            console.error("Custom verification email error:", emailError);
            // Fall back to default message
            toast.success("Account created! Please check your email for verification.");
          } else {
            console.log("Custom verification email sent successfully");
            toast.success("Account created! Please check your email for your 6-digit verification code.");
          }
        } catch (customEmailError) {
          console.error("Failed to send custom verification email:", customEmailError);
          toast.success("Account created! Please check your email for verification.");
        }
        
        return { email };
      }

      // If user is immediately signed in (email confirmation disabled)
      if (data.session) {
        console.log("User signed in immediately");
        toast.success("Account created and signed in successfully!");
        return { email };
      }

      return { email };
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Error creating account");
      throw error;
    }
  };

  return {
    signUp,
  };
};

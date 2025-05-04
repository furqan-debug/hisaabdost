
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSocialAuth = () => {
  const signInWithPhone = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true,
          channel: 'sms',
        },
      });
      
      if (error) {
        console.error("Phone auth error:", error);
        throw error;
      }
      
      toast.info("Verification code sent to your phone");
      return phone;
    } catch (error: any) {
      console.error("Phone auth error:", error);
      toast.error(error.message || "Error sending verification code");
      throw error;
    }
  };

  return {
    signInWithPhone,
  };
};

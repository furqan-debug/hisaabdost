
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const verificationSchema = z.object({
  code: z.string().min(6, "Please enter the full verification code"),
});

type PhoneVerificationFormProps = {
  phone: string;
  onVerify: (code: string) => Promise<void>;
  onBackToLogin: () => void;
};

export const PhoneVerificationForm = ({ phone, onVerify, onBackToLogin }: PhoneVerificationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof verificationSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      await onVerify(values.code);
      toast.success("Verification successful!");
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
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
        toast.success("New verification code sent!");
      }
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.message || "Error resending verification code");
    } finally {
      setResending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
        
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <InputOTP
              maxLength={6}
              value={form.watch("code")}
              onChange={(value) => form.setValue("code", value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify"
            )}
          </Button>
          
          <div className="flex justify-between text-sm">
            <Button 
              type="button" 
              variant="link" 
              size="sm" 
              className="text-xs px-0"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Didn't receive code? Resend"}
            </Button>
            
            <Button 
              type="button" 
              variant="link" 
              size="sm" 
              className="text-xs px-0"
              onClick={onBackToLogin}
            >
              Back to login
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

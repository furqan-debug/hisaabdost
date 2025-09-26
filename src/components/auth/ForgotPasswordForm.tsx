
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";

type ForgotPasswordFormProps = {
  onBackToLogin: () => void;
  onCodeSent: (email: string) => void;
};

export const ForgotPasswordForm = ({ onBackToLogin, onCodeSent }: ForgotPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const { sendPasswordResetCode } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetCode(resetEmail);
      setCodeSent(true);
      onCodeSent(resetEmail);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resetEmail">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="resetEmail"
            type="email"
            placeholder="you@example.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            autoComplete="email"
            className="pl-10"
          />
        </div>
      </div>
      
      {codeSent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex p-3 rounded-md bg-primary/10 text-primary items-start gap-3"
        >
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-2">
            <p className="font-medium">Code sent!</p>
            <p>Please check your email for a 6-digit verification code. Enter the code on the next screen to reset your password.</p>
            <p className="text-xs opacity-75">The code expires in 10 minutes for security.</p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={loading || codeSent}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              <span>Sending Code...</span>
            </div>
          ) : (
            "Send Verification Code"
          )}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBackToLogin}
        >
          Back to login
        </Button>
      </div>
    </form>
  );
};

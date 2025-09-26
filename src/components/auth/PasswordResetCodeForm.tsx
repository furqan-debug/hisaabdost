import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, Timer, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";

type PasswordResetCodeFormProps = {
  email: string;
  onCodeVerified: (email: string, code: string) => void;
  onBackToEmail: () => void;
  onResendCode: () => void;
};

export const PasswordResetCodeForm = ({ 
  email, 
  onCodeVerified, 
  onBackToEmail,
  onResendCode 
}: PasswordResetCodeFormProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const { verifyPasswordResetToken } = usePasswordReset();

  // Countdown timer effect would go here in a real implementation
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    try {
      await verifyPasswordResetToken(email, code);
      onCodeVerified(email, code);
    } catch (error) {
      // Error is handled in the hook with toast
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await onResendCode();
      setTimeLeft(600); // Reset timer
    } catch (error) {
      // Error handled by parent
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">Enter verification code</h3>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-center block">Verification Code</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
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

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>Code expires in {formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify Code"
          )}
        </Button>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendCode}
            disabled={resendLoading || timeLeft > 540} // Can resend after 1 minute
            className="text-sm"
          >
            {resendLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Resend code"
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBackToEmail}
        >
          Use different email
        </Button>
      </div>
    </motion.form>
  );
};
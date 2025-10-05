import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const { verifyPasswordResetToken } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
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
    if (resendCooldown > 0) return;

    try {
      await onResendCode();
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          We sent a 6-digit code to {email}
        </p>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => {
              setCode(value);
              setError("");
            }}
            inputMode="numeric"
            pattern="\d*"
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

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {resendCooldown === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            Didn't receive code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              className="text-primary hover:underline font-medium"
            >
              Resend
            </button>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Resend code in {resendCooldown}s
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>

        <p className="text-sm text-center">
          <button
            type="button"
            onClick={onBackToEmail}
            className="text-muted-foreground hover:text-foreground"
          >
            Use different email
          </button>
        </p>
      </div>
    </form>
  );
};
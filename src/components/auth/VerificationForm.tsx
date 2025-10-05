import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type VerificationFormProps = {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBackToLogin: () => void;
};

export const VerificationForm = ({
  email,
  onVerify,
  onResend,
  onBackToLogin,
}: VerificationFormProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onVerify(verificationCode);
    } catch (error: any) {
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      await onResend();
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
      // Error is handled elsewhere
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
            value={verificationCode}
            onChange={(val) => {
              setVerificationCode(val);
              setError("");
            }}
            inputMode="numeric"
            pattern="\d*"
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
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
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>

        <p className="text-sm text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-muted-foreground hover:text-foreground"
          >
            Back to login
          </button>
        </p>
      </div>
    </form>
  );
};

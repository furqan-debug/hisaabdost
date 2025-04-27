"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

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
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    setVerificationError("");

    try {
      await onVerify(verificationCode);
      setVerificationSuccess(true);
    } catch (error: any) {
      setVerificationError(error.message || "Verification failed. Please try again.");
      setVerificationSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
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
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="otp" className="text-center block">
          Enter the 6-digit verification code sent to {email}
        </Label>

        <div className="flex justify-center pt-2">
          <InputOTP
            maxLength={6}
            value={verificationCode}
            onChange={(val) => setVerificationCode(val)}
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

        {verificationError && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex p-3 mt-2 rounded-md bg-destructive/10 text-destructive items-start gap-3"
          >
            <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{verificationError}</p>
          </motion.div>
        )}

        {verificationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex p-3 mt-2 rounded-md bg-primary/10 text-primary items-start gap-3"
          >
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Verification successful! Redirecting you to dashboard...</p>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          type="submit"
          className="w-full"
          disabled={loading || verificationSuccess || verificationCode.length !== 6}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify Email"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleResendCode}
          disabled={resendLoading || resendCooldown > 0}
        >
          {resendLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : resendCooldown > 0 ? (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Resend code ({resendCooldown}s)</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Resend code</span>
            </>
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

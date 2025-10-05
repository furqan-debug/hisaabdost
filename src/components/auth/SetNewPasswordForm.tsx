import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";

type SetNewPasswordFormProps = {
  email: string;
  code: string;
  onPasswordUpdated: () => void;
  onBack: () => void;
};

export const SetNewPasswordForm = ({ 
  email, 
  code, 
  onPasswordUpdated, 
  onBack 
}: SetNewPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = usePasswordReset();

const isPasswordValid = password.length >= 8 && 
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password) && 
    /[^A-Za-z0-9]/.test(password);
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = isPasswordValid && doPasswordsMatch && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      await updatePassword(email, code, password);
      onPasswordUpdated();
    } catch (error) {
      // Error is handled in the hook with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          Choose a strong, unique password for your account
        </p>
        <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-medium text-foreground">Password must:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className={password.length >= 8 ? "text-green-500" : ""}>
                {password.length >= 8 ? "✓" : "○"}
              </span>
              Be at least 8 characters long
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                {/[A-Z]/.test(password) ? "✓" : "○"}
              </span>
              Include uppercase letters
            </li>
            <li className="flex items-center gap-2">
              <span className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                {/[a-z]/.test(password) ? "✓" : "○"}
              </span>
              Include lowercase letters
            </li>
            <li className="flex items-center gap-2">
              <span className={/[0-9]/.test(password) ? "text-green-500" : ""}>
                {/[0-9]/.test(password) ? "✓" : "○"}
              </span>
              Include numbers
            </li>
            <li className="flex items-center gap-2">
              <span className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}>
                {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"}
              </span>
              Include special characters (!@#$%^&*)
            </li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password.length > 0 && !isPasswordValid && (
            <p className="text-xs text-destructive">
              Please meet all password requirements above
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && !doPasswordsMatch && (
            <p className="text-xs text-destructive">
              Passwords do not match
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !isFormValid}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>

        <p className="text-sm text-center">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        </p>
      </div>
    </form>
  );
};
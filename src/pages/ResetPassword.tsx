import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [resetSuccessful, setResetSuccessful] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        toast({
          variant: "destructive",
          title: "Invalid reset link",
          description: "The reset link is missing required parameters.",
        });
        navigate("/auth");
        return;
      }

      try {
        console.log("🔍 Verifying reset token:", token, "for email:", email);
        
        const { data, error } = await supabase.functions.invoke('verify-reset-code', {
          body: { token, email }
        });

        console.log("✅ Token verification response:", data, error);

        if (error) {
          console.error("❌ Token verification error:", error);
          toast({
            variant: "destructive",
            title: "Invalid or expired link",
            description: "This reset link is invalid or has expired. Please request a new one.",
          });
          navigate("/auth");
          return;
        }

        if (data?.valid) {
          setIsValidToken(true);
        } else {
          toast({
            variant: "destructive",
            title: "Invalid reset link",
            description: "This reset link is invalid or has expired.",
          });
          navigate("/auth");
        }
      } catch (error) {
        console.error("💥 Error verifying token:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify reset link. Please try again.",
        });
        navigate("/auth");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, email, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Resetting password for token:", token);
      
      const { data, error } = await supabase.functions.invoke('update-password-with-code', {
        body: { 
          token, 
          email, 
          newPassword: password 
        }
      });

      console.log("🔄 Password reset response:", data, error);

      if (error) {
        console.error("❌ Password reset error:", error);
        toast({
          variant: "destructive",
          title: "Failed to reset password",
          description: error.message || "An error occurred while resetting your password.",
        });
        return;
      }

      if (data?.success) {
        setResetSuccessful(true);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to reset password",
          description: "The reset link may have expired. Please request a new one.",
        });
      }
    } catch (error) {
      console.error("💥 Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying reset link...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // Will redirect to auth page
  }

  if (resetSuccessful) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-green-600">
              ✅ Password Reset Successful
            </CardTitle>
            <CardDescription className="text-center">
              Your password has been successfully changed
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your password has been updated successfully. You can now log in to your mobile app with your new password.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Please return to your mobile app and log in with your new password.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
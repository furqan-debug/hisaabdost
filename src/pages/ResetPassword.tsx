
import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Lock } from "lucide-react";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const { updatePassword } = usePasswordReset();

  const handlePasswordUpdate = async (email: string, token: string, newPassword: string) => {
    await updatePassword(email, token, newPassword);
    setPasswordUpdated(true);
  };

  if (!token || !email) {
    return <Navigate to="/auth" replace />;
  }

  if (passwordUpdated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Password Updated Successfully!</CardTitle>
            <CardDescription>
              Your password has been updated. You can now log in to the mobile app using your new password.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below to complete the reset process.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <NewPasswordForm
            email={email}
            token={token}
            onPasswordUpdate={handlePasswordUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

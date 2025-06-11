
import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Globe } from "lucide-react";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [showWebForm, setShowWebForm] = useState(false);
  const [appOpenAttempted, setAppOpenAttempted] = useState(false);
  const { updatePassword } = usePasswordReset();

  useEffect(() => {
    // Try to open the mobile app automatically
    if (token && email && !appOpenAttempted) {
      const deepLink = `hisaabdost://reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      
      // Create a hidden link and click it to try opening the app
      const link = document.createElement('a');
      link.href = deepLink;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setAppOpenAttempted(true);
      
      // After a short delay, show the web form option
      setTimeout(() => {
        setShowWebForm(true);
      }, 3000);
    }
  }, [token, email, appOpenAttempted]);

  const handlePasswordUpdate = async (email: string, token: string, newPassword: string) => {
    await updatePassword(email, token, newPassword);
  };

  const resetToLogin = () => {
    window.location.href = '/auth';
  };

  if (!token || !email) {
    return <Navigate to="/auth" replace />;
  }

  if (showWebForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
              <Globe className="h-8 w-8 text-primary" />
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
              onBackToLogin={resetToLogin}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Open in HisaabDost App</CardTitle>
          <CardDescription>
            To reset your password, please open this link in the HisaabDost mobile app.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              If the app didn't open automatically, you can:
            </p>
            
            <div className="space-y-2">
              <Button
                onClick={() => {
                  const deepLink = `hisaabdost://reset-password?token=${token}&email=${encodeURIComponent(email)}`;
                  window.location.href = deepLink;
                }}
                className="w-full"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Open in App
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Don't have the app installed?
              </p>
              
              <Button
                variant="outline"
                onClick={() => {
                  // In a real app, this would link to app stores
                  alert("App download links would be available here in production");
                }}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download HisaabDost
              </Button>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Can't access the mobile app?
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setShowWebForm(true)}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Reset Password in Browser
                </Button>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              This reset link will expire in 15 minutes for security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

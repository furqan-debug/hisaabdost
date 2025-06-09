
import { useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Try to open the mobile app
    if (token && email) {
      const deepLink = `hisaabdost://reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      
      // Create a hidden link and click it to try opening the app
      const link = document.createElement('a');
      link.href = deepLink;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [token, email]);

  if (!token || !email) {
    return <Navigate to="/auth" replace />;
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


import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function CompleteStep() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = async () => {
    try {
      // Ensure the dialog closes and user gets redirected to dashboard
      console.log("Get Started button clicked, navigating to dashboard");
      
      // Force update the onboarding status in the database to ensure it's completed
      if (user) {
        await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
      
      // Show success message
      toast.success("Setup completed! Welcome to your dashboard.");
      
      // Navigate to dashboard
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Something went wrong. Please try again.");
      // Force navigate even if there's an error updating the profile
      navigate("/app/dashboard", { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>You're all set! 🎉</DialogTitle>
        <DialogDescription>
          Thank you for completing the setup. Your personalized experience awaits!
        </DialogDescription>
      </DialogHeader>

      <div className="flex justify-end">
        <Button onClick={handleGetStarted}>
          Get Started
        </Button>
      </div>
    </div>
  );
}

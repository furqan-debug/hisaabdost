
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
      // Update the onboarding status in the database
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      // Show success message
      toast.success("Setup completed! Welcome to your dashboard.");
      
      // Navigate to dashboard with replace:true to prevent back navigation to onboarding
      navigate("/app/dashboard", { replace: true });
      
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong. Please try again.");
      
      // Even if there's an error, try to navigate to dashboard
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

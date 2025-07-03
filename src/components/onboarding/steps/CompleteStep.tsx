
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export function CompleteStep() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    console.log("Get Started button clicked");
    setIsLoading(true);
    
    try {
      // Update the onboarding status in the database
      if (user) {
        console.log("Updating onboarding status for user:", user.id);
        const { error } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) {
          console.error("Database update error:", error);
          throw error;
        }
        console.log("Database update successful");
      }
      
      // Show success message
      toast.success("Setup completed! Welcome to your dashboard.");
      
      // Navigate immediately to dashboard
      console.log("Navigating to dashboard");
      navigate("/app/dashboard", { replace: true });
      
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong, but we'll take you to the dashboard anyway.");
      
      // Navigate to dashboard even if there's an error
      navigate("/app/dashboard", { replace: true });
    } finally {
      setIsLoading(false);
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
        <Button 
          onClick={handleGetStarted}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Setting up..." : "Get Started"}
        </Button>
      </div>
    </div>
  );
}

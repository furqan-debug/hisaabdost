
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

export function CompleteStep() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [navigationAttempted, setNavigationAttempted] = useState(false);

  // Force navigation if user is already completed but still on onboarding
  useEffect(() => {
    if (user && !navigationAttempted) {
      const checkAndNavigate = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();
            
          if (profile?.onboarding_completed) {
            console.log("User already completed onboarding, navigating to dashboard");
            setNavigationAttempted(true);
            navigate("/app/dashboard", { replace: true });
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      };
      
      // Small delay to ensure component is mounted
      setTimeout(checkAndNavigate, 100);
    }
  }, [user, navigate, navigationAttempted]);

  const handleGetStarted = async () => {
    console.log("Get Started button clicked");
    setIsLoading(true);
    setNavigationAttempted(true);
    
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
      
      // Force navigation immediately with multiple fallbacks
      console.log("Navigating to dashboard");
      
      // Primary navigation attempt
      navigate("/app/dashboard", { replace: true });
      
      // Backup navigation with setTimeout to ensure it happens
      setTimeout(() => {
        console.log("Backup navigation attempt");
        navigate("/app/dashboard", { replace: true });
      }, 100);
      
      // Final fallback with window.location
      setTimeout(() => {
        console.log("Final fallback navigation using window.location");
        window.location.href = "/app/dashboard";
      }, 500);
      
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong, but we'll take you to the dashboard anyway.");
      
      // Navigate to dashboard even if there's an error
      navigate("/app/dashboard", { replace: true });
      
      // Fallback navigation for error case
      setTimeout(() => {
        window.location.href = "/app/dashboard";
      }, 500);
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

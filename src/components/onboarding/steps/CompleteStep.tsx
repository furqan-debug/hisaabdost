import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export default function CompleteStep() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = async () => {
    try {
      // Ensure onboarding status is saved in the database
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

      toast.success("Setup completed! Welcome to your dashboard.");
      navigate("/app/dashboard", { replace: true });
      window.location.reload(); // Ensures app state reflects onboarding completion
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong. Please try again.");
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

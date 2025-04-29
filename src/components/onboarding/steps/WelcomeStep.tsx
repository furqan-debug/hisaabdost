
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface WelcomeStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function WelcomeStep({ onComplete, initialData }: WelcomeStepProps) {
  const [fullName, setFullName] = useState(initialData.fullName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!fullName.trim()) {
      return; // Don't proceed if name is empty
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the name immediately to the profile
      if (user && fullName.trim()) {
        console.log("Updating user profile with name:", fullName.trim());
        
        // Update the user's full_name in the profiles table
        await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);

        // Also update the user metadata for backup
        await supabase.auth.updateUser({
          data: { full_name: fullName.trim() }
        });
        
        console.log("Profile updated successfully");
      }

      // Continue with the onboarding flow after a small delay to ensure the state updates properly
      setTimeout(() => {
        console.log("Moving to next step with name:", fullName);
        onComplete({ fullName });
        setIsSubmitting(false);
      }, 100);
      
    } catch (error) {
      console.error("Error updating user name:", error);
      toast.error("Failed to save your name, please try again");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Welcome to Hisaab Dost! 👋</DialogTitle>
        <DialogDescription>
          Let's personalize your experience. First, tell us what we should call you.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Your Name
          </label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && fullName.trim()) {
                handleContinue();
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!fullName.trim() || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}

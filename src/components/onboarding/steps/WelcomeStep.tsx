
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
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save the name immediately to the profile if user is logged in
      if (user && fullName.trim()) {
        console.log("Updating profile for user:", user.id);
        
        // Update the user's full_name in the profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error updating profile:", error);
          toast.error("There was an error updating your name. Please try again.");
          setIsSubmitting(false);
          return;
        }

        // Also update the user metadata for backup
        await supabase.auth.updateUser({
          data: { full_name: fullName.trim() }
        });
        
        console.log("Profile updated successfully");
      }

      // Continue with the onboarding flow even if there's no user or updating profile fails
      console.log("Completing welcome step with name:", fullName);
      
      // Use a slight delay to ensure the UI updates before proceeding
      setTimeout(() => {
        onComplete({ fullName: fullName.trim() });
        setIsSubmitting(false);
      }, 100);
      
    } catch (error) {
      console.error("Error in welcome step:", error);
      toast.error("Something went wrong. Please try again.");
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
            autoFocus
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

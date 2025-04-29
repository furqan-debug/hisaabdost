
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
      toast.error("Please enter your name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the name to the profile
      if (user && fullName.trim()) {
        console.log("Updating user profile with name:", fullName.trim());
        
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);

        if (error) {
          console.error("Error updating profile:", error);
          throw error;
        }

        console.log("Profile updated successfully");
        
        // Move to next step
        onComplete({ fullName });
      } else {
        console.log("Missing user or name", { user, fullName });
        toast.error("Unable to save your name. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user name:", error);
      toast.error("Failed to save your name, please try again");
    } finally {
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

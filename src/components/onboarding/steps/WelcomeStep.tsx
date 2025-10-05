
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { WelcomeHero } from "../WelcomeHero";

interface WelcomeStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function WelcomeStep({ onComplete, initialData }: WelcomeStepProps) {
  const [fullName, setFullName] = useState(initialData.fullName);

  return (
    <div className="space-y-6">
      <WelcomeHero />
      
      <DialogHeader>
        <DialogTitle className="text-2xl">Welcome! 👋</DialogTitle>
        <DialogDescription className="text-base">
          Let's personalize your experience. First, tell us what we should call you.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-foreground">
            Your Name
          </label>
          <Input
            id="name"
            placeholder="Enter your name"
            autoComplete="name"
            autoCorrect="on"
            autoCapitalize="words"
            spellCheck={true}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onComplete({ fullName })} disabled={!fullName.trim()} size="lg" className="min-w-[120px]">
          Continue
        </Button>
      </div>
    </div>
  );
}

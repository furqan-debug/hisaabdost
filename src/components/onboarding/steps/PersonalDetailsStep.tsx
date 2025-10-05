
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { OnboardingFormData } from "../types";
import { useState } from "react";

interface PersonalDetailsStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function PersonalDetailsStep({ onComplete, initialData }: PersonalDetailsStepProps) {
  const [age, setAge] = useState<string>(initialData.age?.toString() || '');
  const [gender, setGender] = useState<OnboardingFormData['gender']>(initialData.gender);

  const handleSubmit = () => {
    onComplete({
      age: age ? parseInt(age, 10) : null,
      gender
    });
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl">Tell us about yourself</DialogTitle>
        <DialogDescription className="text-base">
          This helps us personalize your financial journey
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-semibold text-foreground">
            Age
          </label>
          <Input
            id="age"
            type="number"
            min="13"
            max="120"
            placeholder="Enter your age"
            autoComplete="off"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Gender</label>
          <Select value={gender} onValueChange={(value) => setGender(value as OnboardingFormData['gender'])}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} size="lg" className="min-w-[120px]">
          Continue
        </Button>
      </div>
    </div>
  );
}

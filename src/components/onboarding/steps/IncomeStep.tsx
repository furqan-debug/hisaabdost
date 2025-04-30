
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";

interface IncomeStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function IncomeStep({ onComplete, initialData }: IncomeStepProps) {
  const [income, setIncome] = useState<string>(initialData.monthlyIncome?.toString() || '');
  const { currencyCode } = useCurrency();

  const handleSubmit = () => {
    onComplete({
      monthlyIncome: income ? Number(income) : null
    });
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Set your monthly income</DialogTitle>
        <DialogDescription>
          This helps us provide better insights about your spending habits. You can skip this step if you prefer.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="income" className="text-sm font-medium">
            Monthly Income 
          </label>
          <Input
            id="income"
            type="number"
            min="0"
            placeholder="Enter your monthly income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onComplete({ monthlyIncome: null })}>
          Skip
        </Button>
        <Button onClick={handleSubmit}>
          Continue
        </Button>
      </div>
    </div>
  );
}

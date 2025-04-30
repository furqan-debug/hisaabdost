
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { CURRENCY_OPTIONS, CurrencyOption } from "@/utils/currencyUtils";

interface CurrencyStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function CurrencyStep({ onComplete, initialData }: CurrencyStepProps) {
  const [currency, setCurrency] = useState(initialData.preferredCurrency);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = () => {
    setIsSubmitting(true);
    
    try {
      // Call the onComplete function provided by the parent
      onComplete({ preferredCurrency: currency });
    } catch (error) {
      console.error("Error when completing currency step:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Set your preferred currency</DialogTitle>
        <DialogDescription>
          Choose the currency you'd like to use for all your transactions
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Currency</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select your currency" />
            </SelectTrigger>
            <SelectContent className="touch-scroll">
              {CURRENCY_OPTIONS.map((currency: CurrencyOption) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center">
                    <span className="mr-2">{currency.symbol}</span>
                    <span>{currency.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleComplete} 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}

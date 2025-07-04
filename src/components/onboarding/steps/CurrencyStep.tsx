
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { CURRENCY_OPTIONS, CurrencyOption, CurrencyCode } from "@/utils/currencyUtils";

interface CurrencyStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function CurrencyStep({ onComplete, initialData }: CurrencyStepProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(initialData.preferredCurrency as CurrencyCode || "PKR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (isSubmitting) return;
    
    console.log("Currency step: Starting completion with currency:", currency);
    setIsSubmitting(true);
    
    try {
      await onComplete({ preferredCurrency: currency });
    } catch (error) {
      console.error("Error in currency step completion:", error);
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
          <Select value={currency} onValueChange={(value: CurrencyCode) => setCurrency(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your currency" />
            </SelectTrigger>
            <SelectContent className="touch-scroll">
              {CURRENCY_OPTIONS.map((currencyOption: CurrencyOption) => (
                <SelectItem key={currencyOption.code} value={currencyOption.code}>
                  <div className="flex items-center">
                    <span className="mr-2">{currencyOption.symbol}</span>
                    <span>{currencyOption.label}</span>
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
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Completing Setup..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}

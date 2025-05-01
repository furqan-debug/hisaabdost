
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { CURRENCY_OPTIONS, CurrencyOption, CurrencyCode } from "@/utils/currencyUtils";
import { toast } from "sonner";

interface CurrencyStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function CurrencyStep({ onComplete, initialData }: CurrencyStepProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(initialData.preferredCurrency as CurrencyCode || "USD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Ensure we have a valid currency selected
      if (!currency) {
        toast.error("Please select a currency before continuing");
        setIsSubmitting(false);
        return;
      }
      
      // Pass the selected currency to the parent component
      onComplete({ preferredCurrency: currency });
      
      // Note: We don't reset isSubmitting here since the parent component
      // will handle transitioning to the next step or showing errors
    } catch (error) {
      console.error("Error in currency step:", error);
      toast.error("Something went wrong. Please try again.");
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
        >
          {isSubmitting ? "Saving..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}

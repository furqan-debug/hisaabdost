
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { CURRENCY_OPTIONS, CurrencyOption, CurrencyCode } from "@/utils/currencyUtils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface CurrencyStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function CurrencyStep({ onComplete, initialData }: CurrencyStepProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(initialData.preferredCurrency as CurrencyCode || "USD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleComplete = async () => {
    if (isSubmitting) return;
    
    try {
      if (!currency) {
        toast.error("Please select a currency before continuing");
        return;
      }
      
      if (!user) {
        toast.error("User not authenticated");
        return;
      }
      
      setIsSubmitting(true);
      console.log("Starting final onboarding step with currency:", currency);
      
      // Complete the onboarding data first
      const finalFormData = { ...initialData, preferredCurrency: currency };
      console.log("Final form data:", finalFormData);
      
      // Save all data to the profile and mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: finalFormData.fullName,
          age: finalFormData.age,
          gender: finalFormData.gender,
          preferred_currency: finalFormData.preferredCurrency,
          monthly_income: finalFormData.monthlyIncome,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error saving final onboarding data:", error);
        throw error;
      }

      console.log("Onboarding data saved successfully");
      toast.success("Setup completed! Welcome to your dashboard.");
      
      // Force navigation immediately after successful save
      console.log("Navigating to dashboard");
      navigate("/app/dashboard", { replace: true });
      
      // Also call the parent completion handler for cleanup
      onComplete({ preferredCurrency: currency });
      
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong, but we'll take you to the dashboard anyway.");
      
      // Navigate even on error to prevent getting stuck
      navigate("/app/dashboard", { replace: true });
      onComplete({ preferredCurrency: currency });
    } finally {
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
          {isSubmitting ? "Setting up..." : "Get Started"}
        </Button>
      </div>
    </div>
  );
}

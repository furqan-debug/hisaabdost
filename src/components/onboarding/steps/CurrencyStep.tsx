
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingFormData } from "../types";
import { useState } from "react";
import { CURRENCY_OPTIONS, CurrencyOption, CurrencyCode } from "@/utils/currencyUtils";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CurrencyStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function CurrencyStep({ onComplete, initialData }: CurrencyStepProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(initialData.preferredCurrency as CurrencyCode || "PKR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (isSubmitting) return;
    
    console.log("Currency step: Starting completion with currency:", currency);
    setIsSubmitting(true);
    
    try {
      if (!user?.id) {
        console.error("No user ID available");
        toast.error("Authentication error. Please try again.");
        return;
      }

      const updatedData = { ...initialData, preferredCurrency: currency };
      
      console.log("Updating profile with final data:", {
        full_name: updatedData.fullName,
        age: updatedData.age,
        gender: updatedData.gender,
        preferred_currency: updatedData.preferredCurrency,
        monthly_income: updatedData.monthlyIncome,
        onboarding_completed: true,
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedData.fullName,
          age: updatedData.age,
          gender: updatedData.gender,
          preferred_currency: updatedData.preferredCurrency,
          monthly_income: updatedData.monthlyIncome,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Profile updated successfully");
      toast.success("Setup completed! Welcome to your dashboard.");
      
      // Navigate immediately without delay
      console.log("Navigating to dashboard immediately");
      navigate("/app/dashboard", { replace: true });
      
      // Force refresh if navigation doesn't work
      setTimeout(() => {
        if (window.location.pathname !== '/app/dashboard') {
          console.log("Forcing navigation with window.location");
          window.location.href = "/app/dashboard";
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
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

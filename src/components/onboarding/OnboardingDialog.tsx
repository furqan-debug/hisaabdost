
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { IncomeStep } from './steps/IncomeStep';
import { CurrencyStep } from './steps/CurrencyStep';
import { CompleteStep } from './steps/CompleteStep';
import { OnboardingStep, OnboardingFormData } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface OnboardingDialogProps {
  open: boolean;
}

export function OnboardingDialog({ open }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: '',
    age: null,
    gender: 'prefer-not-to-say',
    preferredCurrency: 'USD',
    monthlyIncome: null
  });
  const { user } = useAuth();

 const handleStepComplete = async (step: OnboardingStep, data: Partial<OnboardingFormData>) => {
  try {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    console.log(`Step "${step}" completed with data:`, data);
    console.log("Updated form data:", updatedData);

    if (step === 'currency') {
      if (!user?.id) {
        console.error("No user found when completing currency step");
        toast.error("Authentication error. Please try again.");
        return;
      }

      // Optional: Update Supabase auth metadata
      if (updatedData.fullName) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { full_name: updatedData.fullName }
        });
        if (metadataError) {
          console.error("Metadata update failed:", metadataError);
          toast.error("Failed to update your profile information.");
          return;
        }
      }

      // Main update to profiles table — validate it worked
      const { data: updatedProfile, error: profileError } = await supabase
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
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (profileError) {
        console.error("Supabase update error:", profileError);
        toast.error("Failed to save your preferences.");
        return;
      }

      if (!updatedProfile) {
        console.error("No matching profile row found for user ID:", user.id);
        toast.error("Profile not found in database.");
        return;
      }

      console.log("Profile update successful:", updatedProfile);
      toast.success("Preferences saved!");
      setCurrentStep('complete');
    } else {
      const nextSteps: Record<OnboardingStep, OnboardingStep> = {
        welcome: 'personal',
        personal: 'income',
        income: 'currency',
        currency: 'complete',
        complete: 'complete'
      };
      setCurrentStep(nextSteps[step]);
    }
  } catch (error) {
    console.error(`Unexpected error in step "${step}":`, error);
    toast.error("Something went wrong. Please try again.");
  }
};

  const steps = {
    welcome: <WelcomeStep onComplete={data => handleStepComplete('welcome', data)} initialData={formData} />,
    personal: <PersonalDetailsStep onComplete={data => handleStepComplete('personal', data)} initialData={formData} />,
    income: <IncomeStep onComplete={data => handleStepComplete('income', data)} initialData={formData} />,
    currency: <CurrencyStep onComplete={data => handleStepComplete('currency', data)} initialData={formData} />,
    complete: <CompleteStep />
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-[500px]">
        {steps[currentStep]}
      </DialogContent>
    </Dialog>
  );
}

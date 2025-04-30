
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
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (step === 'currency') {
      try {
        // Update user metadata to ensure the full name is available in user.user_metadata
        if (user && updatedData.fullName) {
          await supabase.auth.updateUser({
            data: { full_name: updatedData.fullName }
          });
        }
        
        // Update the profile table
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
          .eq('id', user?.id);

        if (error) throw error;
        setCurrentStep('complete');
      } catch (error) {
        toast.error('Failed to save your preferences');
        console.error('Error saving onboarding data:', error);
      }
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

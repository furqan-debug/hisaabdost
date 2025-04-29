
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
    console.log(`Completing step: ${step} with data:`, data);
    
    // Update form data with new values
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    console.log("Updated form data:", updatedData);

    if (step === 'currency') {
      try {
        console.log("Finalizing onboarding for user:", user?.id);
        
        if (!user?.id) {
          console.error("No user ID available for saving onboarding data");
          toast.error('Authentication error. Please try logging in again.');
          return;
        }
        
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
          console.error("Failed to save onboarding data:", error);
          toast.error('Failed to save your preferences');
          return;
        }
        
        console.log("Onboarding completed successfully");
        setCurrentStep('complete');
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        toast.error('Failed to save your preferences');
      }
    } else {
      // Move to next step
      const nextSteps: Record<OnboardingStep, OnboardingStep> = {
        welcome: 'personal',
        personal: 'income',
        income: 'currency',
        currency: 'complete',
        complete: 'complete'
      };
      
      const nextStep = nextSteps[step];
      console.log(`Moving to next step: ${nextStep}`);
      
      // Use a small timeout to ensure state updates properly
      setTimeout(() => {
        setCurrentStep(nextStep);
      }, 100);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onComplete={data => handleStepComplete('welcome', data)} initialData={formData} />;
      case 'personal':
        return <PersonalDetailsStep onComplete={data => handleStepComplete('personal', data)} initialData={formData} />;
      case 'income':
        return <IncomeStep onComplete={data => handleStepComplete('income', data)} initialData={formData} />;
      case 'currency':
        return <CurrencyStep onComplete={data => handleStepComplete('currency', data)} initialData={formData} />;
      case 'complete':
        return <CompleteStep />;
      default:
        return <WelcomeStep onComplete={data => handleStepComplete('welcome', data)} initialData={formData} />;
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-[500px]">
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
}

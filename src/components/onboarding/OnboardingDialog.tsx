
import React, { useState, useEffect } from 'react';
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
    preferredCurrency: 'PKR',
    monthlyIncome: null
  });
  const { user } = useAuth();

  // Debug logging for component mounts and step changes
  useEffect(() => {
    console.log("OnboardingDialog mounted, current step:", currentStep);
  }, []);

  useEffect(() => {
    console.log("Step changed to:", currentStep);
  }, [currentStep]);

  const handleStepComplete = async (step: OnboardingStep, data: Partial<OnboardingFormData>) => {
    console.log(`Step ${step} completed with data:`, data);
    
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    console.log("Updated form data:", updatedData);

    // Move to the next step based on the current step
    const nextSteps: Record<OnboardingStep, OnboardingStep> = {
      welcome: 'personal',
      personal: 'income',
      income: 'currency',
      currency: 'complete',
      complete: 'complete'
    };
    
    // If it's the final step, save all data to the profile
    if (step === 'currency') {
      try {
        console.log("Final step reached, saving all data to profile");
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

        if (error) {
          console.error("Error saving profile data:", error);
          throw error;
        }
        setCurrentStep('complete');
      } catch (error) {
        toast.error('Failed to save your preferences');
        console.error('Error saving onboarding data:', error);
      }
    } else {
      console.log(`Moving from ${step} to ${nextSteps[step]}`);
      setCurrentStep(nextSteps[step]);
    }
  };

  // Create the component for the current step with proper props and handlers
  const renderCurrentStep = () => {
    console.log("Rendering step:", currentStep);
    
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep 
          onComplete={(data) => handleStepComplete('welcome', data)} 
          initialData={formData} 
        />;
      case 'personal':
        return <PersonalDetailsStep 
          onComplete={(data) => handleStepComplete('personal', data)} 
          initialData={formData} 
        />;
      case 'income':
        return <IncomeStep 
          onComplete={(data) => handleStepComplete('income', data)} 
          initialData={formData} 
        />;
      case 'currency':
        return <CurrencyStep 
          onComplete={(data) => handleStepComplete('currency', data)} 
          initialData={formData} 
        />;
      case 'complete':
        return <CompleteStep />;
      default:
        return <WelcomeStep 
          onComplete={(data) => handleStepComplete('welcome', data)} 
          initialData={formData} 
        />;
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
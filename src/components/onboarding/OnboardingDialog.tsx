
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { IncomeStep } from './steps/IncomeStep';
import { CurrencyStep } from './steps/CurrencyStep';
import { OnboardingStep, OnboardingFormData } from './types';
import { useAuth } from '@/lib/auth';

interface OnboardingDialogProps {
  open: boolean;
}

export function OnboardingDialog({ open }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [dialogOpen, setDialogOpen] = useState(open);
  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: '',
    age: null,
    gender: 'prefer-not-to-say',
    preferredCurrency: 'PKR',
    monthlyIncome: null
  });
  const { user } = useAuth();

  // Sync dialog state with prop
  useEffect(() => {
    setDialogOpen(open);
  }, [open]);

  // Debug logging for component mounts and step changes
  useEffect(() => {
    console.log("OnboardingDialog mounted, current step:", currentStep);
  }, []);

  useEffect(() => {
    console.log("Step changed to:", currentStep);
  }, [currentStep]);

  const handleStepComplete = (step: OnboardingStep, data: Partial<OnboardingFormData>) => {
    console.log(`Step ${step} completed with data:`, data);
    
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    console.log("Updated form data:", updatedData);

    // Move to the next step based on the current step
    if (step === 'welcome') {
      setCurrentStep('personal');
    } else if (step === 'personal') {
      setCurrentStep('income');
    } else if (step === 'income') {
      setCurrentStep('currency');
    } else if (step === 'currency') {
      // Currency step completed - close dialog
      console.log("Currency step completed, closing onboarding dialog");
      setDialogOpen(false);
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
      default:
        return <WelcomeStep 
          onComplete={(data) => handleStepComplete('welcome', data)} 
          initialData={formData} 
        />;
    }
  };

  return (
    <Dialog open={dialogOpen} modal onOpenChange={(isOpen) => {
      if (!isOpen && currentStep !== 'currency') {
        // Only allow closing if not on currency step or if onboarding is complete
        setDialogOpen(false);
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
}

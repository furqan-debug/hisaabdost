
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { IncomeStep } from './steps/IncomeStep';
import { CurrencyStep } from './steps/CurrencyStep';
import { OnboardingStep, OnboardingFormData } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    const nextSteps: Record<OnboardingStep, OnboardingStep | null> = {
      welcome: 'personal',
      personal: 'income',
      income: 'currency',
      currency: null, // Final step
    };
    
    // If it's the final step (currency), save all data and redirect to dashboard
    if (step === 'currency') {
      console.log("Final step reached, saving data and navigating");
      
      try {
        if (!user?.id) {
          console.error("No user ID available");
          toast.error("Authentication error. Please try again.");
          return;
        }

        console.log("Updating profile with data:", {
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

        console.log("Profile updated successfully, showing success message");
        toast.success("Setup completed! Welcome to your dashboard.");
        
        // Small delay to ensure toast shows, then navigate
        setTimeout(() => {
          console.log("Navigating to dashboard now");
          navigate("/app/dashboard", { replace: true });
        }, 500);
        
      } catch (error) {
        console.error('Error completing onboarding:', error);
        toast.error('Failed to complete setup. Please try again.');
      }
    } else {
      // Move to next step
      const nextStep = nextSteps[step];
      if (nextStep) {
        console.log(`Moving from ${step} to ${nextStep}`);
        setCurrentStep(nextStep);
      }
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
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-[500px]">
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
}


export type OnboardingStep = 'welcome' | 'personal' | 'income' | 'currency' | 'complete';

export interface OnboardingFormData {
  fullName: string;
  age: number | null;
  gender: string;
  preferredCurrency: string;
  monthlyIncome: number | null;
}

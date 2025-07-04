
export type OnboardingStep = 'welcome' | 'personal' | 'income' | 'currency';

export interface OnboardingFormData {
  fullName: string;
  age: number | null;
  gender: string;
  preferredCurrency: string;
  monthlyIncome: number | null;
}

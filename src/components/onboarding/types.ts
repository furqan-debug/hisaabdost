
export type OnboardingStep = 'welcome' | 'personal' | 'income' | 'currency';

export interface OnboardingFormData {
  fullName: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  preferredCurrency: string;
  monthlyIncome: number | null;
}

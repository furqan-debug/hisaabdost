
export type OnboardingStep = 'welcome' | 'personal' | 'currency' | 'complete';

export interface OnboardingFormData {
  fullName: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  preferredCurrency: string;
}


export type OnboardingStep = 'welcome' | 'personal' | 'income' | 'currency' | 'notifications' | 'complete';

export interface OnboardingFormData {
  fullName: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  preferredCurrency: string;
  monthlyIncome: number | null;
  notificationsEnabled?: boolean;
  notificationTime?: string;
}

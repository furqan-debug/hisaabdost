
export type OnboardingStep = 'welcome' | 'personal' | 'income' | 'currency' | 'notifications' | 'complete';

export interface OnboardingFormData {
  fullName: string;
  age: number | null;
  gender: string;
  preferredCurrency: string;
  monthlyIncome: number | null;
  notificationsEnabled: boolean;
  pushNotificationsEnabled?: boolean;
  notificationTime: string;
}


export type CurrencyCode = 
  | 'USD' 
  | 'EUR' 
  | 'GBP' 
  | 'JPY' 
  | 'CAD' 
  | 'AUD' 
  | 'CHF' 
  | 'CNY' 
  | 'INR' 
  | 'PKR' 
  | 'MXN' 
  | 'BRL' 
  | 'RUB' 
  | 'KRW' 
  | 'SGD';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan (¥)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'PKR', symbol: 'Rs', label: 'Pakistani Rupee (Rs)' },
  { code: 'MXN', symbol: 'Mex$', label: 'Mexican Peso (Mex$)' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real (R$)' },
  { code: 'RUB', symbol: '₽', label: 'Russian Ruble (₽)' },
  { code: 'KRW', symbol: '₩', label: 'South Korean Won (₩)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
];

// Default currency code
export const DEFAULT_CURRENCY_CODE: CurrencyCode = 'USD';

// Find currency option by code
export function getCurrencyByCode(code: CurrencyCode): CurrencyOption {
  return CURRENCY_OPTIONS.find(option => option.code === code) || CURRENCY_OPTIONS[0];
}

import { Country } from '@/data/countries';

// Phone number formatting patterns for different countries
const formatPatterns: Record<string, (value: string) => string> = {
  // US/Canada: (123) 456-7890
  '+1': (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    // Partial formatting
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  },

  // UK: +44 20 1234 5678
  '+44': (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
  },

  // India: +91 98765 43210
  '+91': (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  },

  // Germany: +49 30 12345678
  '+49': (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 10)}`;
  },

  // France: +33 1 23 45 67 89
  '+33': (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 3) return `${cleaned.slice(0, 1)} ${cleaned.slice(1)}`;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  },

  // Australia: +61 4 1234 5678
  '+61': (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 1)} ${cleaned.slice(1)}`;
    return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5, 9)}`;
  },
};

// Default formatter for countries without specific patterns
const defaultFormatter = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  // Add spaces every 3-4 digits for readability
  return cleaned.replace(/(\d{3,4})(?=\d)/g, '$1 ');
};

export const formatPhoneNumber = (value: string, country?: Country): string => {
  if (!country) return value;
  
  const formatter = formatPatterns[country.dialCode] || defaultFormatter;
  return formatter(value);
};

// Phone number validation patterns
const validationPatterns: Record<string, RegExp> = {
  '+1': /^\d{10}$/, // US/Canada: 10 digits
  '+44': /^\d{10,11}$/, // UK: 10-11 digits
  '+91': /^\d{10}$/, // India: 10 digits
  '+49': /^\d{10,11}$/, // Germany: 10-11 digits
  '+33': /^\d{9}$/, // France: 9 digits
  '+61': /^\d{9}$/, // Australia: 9 digits
};

export const validatePhoneNumber = (value: string, country?: Country): boolean => {
  if (!country) return false;
  
  const cleaned = value.replace(/\D/g, '');
  const pattern = validationPatterns[country.dialCode];
  
  if (pattern) {
    return pattern.test(cleaned);
  }
  
  // Default validation: 7-15 digits
  return cleaned.length >= 7 && cleaned.length <= 15;
};

export const getPhoneNumberPlaceholder = (country?: Country): string => {
  if (!country) return "Enter phone number";
  
  const placeholders: Record<string, string> = {
    '+1': '(123) 456-7890',
    '+44': '20 1234 5678',
    '+91': '98765 43210',
    '+49': '30 12345678',
    '+33': '1 23 45 67 89',
    '+61': '4 1234 5678',
  };
  
  return placeholders[country.dialCode] || 'Enter phone number';
};
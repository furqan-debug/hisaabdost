
import { CurrencyCode, getCurrencyByCode } from './currencyUtils';

/**
 * Format a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The currency code to use for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'USD'): string {
  try {
    // Special handling for INR to support lakhs and crores notation
    if (currencyCode === 'INR') {
      if (amount >= 10000000) { // 1 crore = 10,000,000
        return `₹${(amount / 10000000).toFixed(2)} crore`;
      } else if (amount >= 100000) { // 1 lakh = 100,000
        return `₹${(amount / 100000).toFixed(2)} lakh`;
      }
    }
    
    // Default currency formatting using Intl
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // For currencies like PKR Rs, which might not be formatted correctly by Intl
    if (currencyCode === 'PKR') {
      const currencyOption = getCurrencyByCode(currencyCode);
      return `${currencyOption.symbol} ${amount.toFixed(2)}`;
    }
    
    return formatter.format(amount);
  } catch (e) {
    // Fallback to USD if there's any error
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

/**
 * Format a date string to a human-readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}


import { CurrencyCode, getCurrencyByCode } from './currencyUtils';

/**
 * Format a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The currency code to use for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'USD'): string {
  const currencyOption = getCurrencyByCode(currencyCode);
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // For some currencies, we might want to override the default Intl.NumberFormat behavior
  // to show the custom symbols
  const formatted = formatter.format(amount);
  
  // For currencies like PKR Rs, which might not be formatted correctly by Intl
  if (currencyCode === 'PKR') {
    // Replace the currency symbol with our custom one
    return `${currencyOption.symbol} ${amount.toFixed(2)}`;
  }
  
  return formatted;
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

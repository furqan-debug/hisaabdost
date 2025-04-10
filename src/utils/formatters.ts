
import { useCurrency } from "@/hooks/use-currency";

/**
 * Format a number as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  // This is called from components that can use hooks
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number as currency with the specified currency
 * @param amount The amount to format
 * @param currencyCode The currency code to use
 * @returns Formatted currency string
 */
export function formatCurrencyWithCode(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number as currency with the specified symbol
 * @param amount The amount to format
 * @param symbol The currency symbol to use
 * @returns Formatted currency string with custom symbol
 */
export function formatCurrencyWithSymbol(amount: number, symbol: string): string {
  // Format without currency symbol
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  // Add the custom symbol
  return `${symbol}${formatted}`;
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

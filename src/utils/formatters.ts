
import { CurrencySymbol } from "@/hooks/use-currency-context";

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currencySymbol The currency symbol to use
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencySymbol: CurrencySymbol = "$"): string {
  // Define currency code based on symbol
  const currencyCode = 
    currencySymbol === "$" ? "USD" :
    currencySymbol === "₹" ? "INR" :
    currencySymbol === "€" ? "EUR" :
    currencySymbol === "£" ? "GBP" :
    currencySymbol === "¥" ? "JPY" : "USD";

  // For ₹ (Indian Rupee), we'll want to place the symbol before the number
  if (currencySymbol === "₹") {
    return `${currencySymbol}${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    // Use currencyDisplay 'narrowSymbol' only for JPY to get the correct ¥ symbol
    currencyDisplay: currencyCode === 'JPY' ? 'narrowSymbol' : 'symbol'
  }).format(amount);
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


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
    currencySymbol === "¥" ? "JPY" :
    currencySymbol === "₽" ? "RUB" :
    currencySymbol === "₩" ? "KRW" :
    currencySymbol === "A$" ? "AUD" :
    currencySymbol === "C$" ? "CAD" :
    currencySymbol === "Fr" ? "CHF" :
    currencySymbol === "₺" ? "TRY" :
    currencySymbol === "R" ? "ZAR" :
    currencySymbol === "₴" ? "UAH" :
    currencySymbol === "₪" ? "ILS" :
    currencySymbol === "Rs" ? "PKR" : "USD";

  // Special formatting for certain currencies
  if (currencySymbol === "₹" || currencySymbol === "Rs") {
    return `${currencySymbol} ${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)}`;
  }

  // Currencies that typically don't show decimals
  const noDecimalCurrencies = ["JPY", "KRW"];
  const fractionDigits = noDecimalCurrencies.includes(currencyCode) ? 0 : 2;

  // For specific symbols that need to be displayed differently than Intl formatter
  if (currencySymbol === "A$" || currencySymbol === "C$" || currencySymbol === "Fr" || 
      currencySymbol === "₽" || currencySymbol === "₩" || currencySymbol === "₺" || 
      currencySymbol === "R" || currencySymbol === "₴" || currencySymbol === "₪" || 
      currencySymbol === "Rs") {
    return `${currencySymbol} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(amount)}`;
  }

  // Use standard Intl formatter for other currencies
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    currencyDisplay: 'symbol'
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

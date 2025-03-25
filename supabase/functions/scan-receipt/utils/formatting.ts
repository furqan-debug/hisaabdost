
// Format a price number to a standard string format
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

// Capitalize the first letter of a string
export function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Format a date to a standard string format (YYYY-MM-DD)
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Parse a number from a string, handling various formats
export function parseNumber(str: string): number {
  if (!str) return 0;
  
  // Remove currency symbols and other non-numeric characters except for decimal points
  const cleanedStr = str.replace(/[^\d.,]/g, '')
                        .replace(',', '.'); // Replace comma with dot for decimal
  
  return parseFloat(cleanedStr) || 0;
}

// Check if a string contains a valid price
export function containsPrice(str: string): boolean {
  // Match patterns like $12.99, 12,99€, ₹12.99, etc.
  return /[\$€₹]?\s*\d+[.,]\d{2}/.test(str);
}

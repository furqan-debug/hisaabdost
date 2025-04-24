
// Format a price number to a standard string format
export function formatPrice(price: number, currencyCode = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  } catch (e) {
    // Fallback to simple formatting
    return price.toFixed(2);
  }
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
  
  try {
    // Remove currency symbols and other non-numeric characters except for decimal points
    const cleanedStr = str.replace(/[^\d.,]/g, '')
                          .replace(',', '.'); // Replace comma with dot for decimal
    
    const result = parseFloat(cleanedStr);
    return isNaN(result) ? 0 : result;
  } catch (error) {
    console.error("Error parsing number:", error);
    return 0;
  }
}

// Check if a string contains a valid price
export function containsPrice(str: string): boolean {
  if (!str) return false;
  
  try {
    // Match patterns like $12.99, 12,99€, ₹12.99, etc.
    return /[\$€₹]?\s*\d+[.,]\d{2}/.test(str);
  } catch (error) {
    console.error("Error checking if string contains price:", error);
    return false;
  }
}

// Safe function to check if a string is a valid URL
export function isValidUrl(str: string): boolean {
  if (!str) return false;
  
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
}

// Safely check if a blob URL is still valid
export function isBlobUrlValid(url: string): boolean {
  if (!url || !url.startsWith('blob:')) return false;
  
  try {
    // We can't directly check if a blob URL is valid without trying to access it
    // This is a basic check to ensure it at least has the right format
    return url.length > 10; // Basic length check for valid blob URLs
  } catch (error) {
    console.error("Error checking blob URL validity:", error);
    return false;
  }
}

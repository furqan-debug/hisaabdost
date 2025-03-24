
/**
 * Format date for storage in the database
 */
export function formatDateForStorage(dateString?: string): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    // If it's already in ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      return dateString.split('T')[0];
    }
    
    // Try to parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Return as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Calculate the total amount from an array of items
 */
export function calculateTotal(items: Array<{name: string; amount: string}>): string {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return "0.00";
  }
  
  const total = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount);
    return isNaN(amount) ? sum : sum + amount;
  }, 0);
  
  return total.toFixed(2);
}

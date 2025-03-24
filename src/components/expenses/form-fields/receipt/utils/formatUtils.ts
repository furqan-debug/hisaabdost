
// Format a date for storage in the database
export function formatDateForStorage(dateString: string): string {
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    // Parse the date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split('T')[0]; // Today's date as fallback
  }
}

// Calculate the total amount from a list of items
export function calculateTotal(items: Array<{amount: string}>): string {
  if (!items || items.length === 0) {
    return "0.00";
  }
  
  const total = items.reduce((sum, item) => {
    return sum + parseFloat(item.amount || "0");
  }, 0);
  
  return total.toFixed(2);
}

// Clean up an item description to make it more readable
export function cleanItemDescription(description: string): string {
  if (!description) return "";
  
  // Remove common prefixes
  let cleaned = description
    .replace(/^item[:.\s-]+/i, '')
    .replace(/^product[:.\s-]+/i, '')
    .replace(/^[a-z]{1,3}\d{4,}[:.\s-]*/i, '') // Remove SKU/UPC codes
    .replace(/^\d+\s+/, ''); // Remove leading numbers
  
  // Truncate very long descriptions
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50) + '...';
  }
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

// Format a date for the expense form
export function formatDateForForm(dateString?: string): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  return formatDateForStorage(dateString);
}

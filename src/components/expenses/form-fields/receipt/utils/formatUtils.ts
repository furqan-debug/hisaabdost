
// Format date for database storage
export function formatDateForStorage(dateString: string | undefined): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

// Calculate total from items
export function calculateTotal(items: Array<{amount: string}>): string {
  if (!items || items.length === 0) return "0.00";
  
  try {
    const total = items.reduce((sum, item) => {
      return sum + parseFloat(item.amount || "0");
    }, 0);
    return total.toFixed(2);
  } catch (error) {
    return "0.00";
  }
}

// Format date from receipt for the expense form
export function formatDateForForm(dateString: string): string {
  if (!dateString) return '';
  
  try {
    // If already in ISO format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parse various date formats
    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split('T')[0];
  }
}

// Clean up item description for better readability
export function cleanItemDescription(description: string): string {
  if (!description) return '';
  
  // Clean up common prefixes and codes
  let cleaned = description
    .replace(/^[\d#]+\s+/, '')        // Remove leading numbers/codes
    .replace(/^[a-z]{1,3}\d{4,}\s+/i, '') // Remove SKU/product codes
    .replace(/\(\d+\s*[xX]\)/i, '')   // Remove quantity indicators
    .replace(/\s{2,}/g, ' ');         // Remove extra spaces
  
  // Truncate very long descriptions
  if (cleaned.length > 40) {
    cleaned = cleaned.substring(0, 40) + '...';
  }
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

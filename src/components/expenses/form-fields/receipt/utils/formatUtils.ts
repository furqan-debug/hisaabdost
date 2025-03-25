
/**
 * Utility functions for formatting and validating receipt data
 */

// Validate and format a date string
export const formatSafeDate = (dateStr: string): string => {
  try {
    // If it's already in YYYY-MM-DD format, validate it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return dateStr;
    }
    
    // Try to parse the date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // Check for DD-MM-YYYY or MM-DD-YYYY formats
    const parts = dateStr.split(/[-\/\.]/);
    if (parts.length === 3) {
      // Try both date formats
      const formats = [
        // MM-DD-YYYY
        new Date(`${parts[2]}-${parts[0]}-${parts[1]}`),
        // DD-MM-YYYY
        new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      ];
      
      for (const date of formats) {
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Default to today if parsing fails
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    console.error("Date parsing error:", e);
    return new Date().toISOString().split('T')[0];
  }
};

// Format amount removing any currency symbols and ensuring proper number format
export const formatSafeAmount = (amount: string): string => {
  if (!amount) return "0.00";
  
  // Remove currency symbols and non-numeric characters except decimal point
  let cleaned = amount.replace(/[^\d.,]/g, '');
  
  // Replace comma with dot for decimal separator if needed
  cleaned = cleaned.replace(',', '.');
  
  // Ensure it's a valid number
  const num = parseFloat(cleaned);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

// Sanitize description to ensure it's valid
export const formatSafeDescription = (desc: string): string => {
  if (!desc) return "Store Purchase";
  
  // Trim and limit length
  let cleaned = desc.trim();
  if (cleaned.length > 50) cleaned = cleaned.substring(0, 50);
  
  // Ensure first letter is capitalized
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Validate and format receipt data
export const formatReceiptItem = (item: {
  description: string;
  amount: string;
  date: string;
  category?: string;
  paymentMethod?: string;
}, defaultDate?: string) => {
  return {
    description: formatSafeDescription(item.description),
    amount: formatSafeAmount(item.amount),
    date: formatSafeDate(item.date || defaultDate || ''),
    category: item.category || "Other",
    paymentMethod: item.paymentMethod || "Card"
  };
};

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
    
    // Check for DD.MM.YYYY (European format with dots)
    const dotParts = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (dotParts) {
      const day = parseInt(dotParts[1], 10);
      const month = parseInt(dotParts[2], 10);
      const year = parseInt(dotParts[3], 10);
      
      // Validate components
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
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
  
  // Remove currency symbols and non-numeric characters except decimal point and comma
  let cleaned = amount.replace(/[^\d.,]/g, '');
  
  // Handle European format with comma as decimal separator
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    cleaned = cleaned.replace(',', '.');
  } 
  // Handle case where there are both commas and periods (e.g. 1,234.56)
  else if (cleaned.includes(',') && cleaned.includes('.')) {
    // If comma comes before period, it's thousand separator (remove it)
    if (cleaned.indexOf(',') < cleaned.indexOf('.')) {
      cleaned = cleaned.replace(/,/g, '');
    } 
    // Otherwise, comma is decimal separator in some formats
    else {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  }
  
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
  
  // Remove non-descriptive prefixes
  cleaned = cleaned.replace(/^item[\s:-]+/i, '')
                   .replace(/^product[\s:-]+/i, '')
                   .replace(/^#\d+\s+/, ''); // Item numbers
  
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

// Guess category based on item description
export const guessCategoryFromDescription = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  
  // Food and groceries
  if (lowerDesc.includes('grocer') || 
      lowerDesc.includes('food') || 
      lowerDesc.includes('supermarket') ||
      lowerDesc.includes('market') ||
      lowerDesc.includes('mart') ||
      lowerDesc.includes('aldi') ||
      lowerDesc.includes('lidl') ||
      lowerDesc.includes('tesco') ||
      lowerDesc.includes('sainsbury') ||
      lowerDesc.includes('carrefour') ||
      lowerDesc.includes('edeka') ||
      lowerDesc.includes('kaufland') ||
      lowerDesc.includes('rewe')) {
    return "Groceries";
  }
  
  // Restaurants and dining
  if (lowerDesc.includes('restaurant') || 
      lowerDesc.includes('cafe') || 
      lowerDesc.includes('bar') ||
      lowerDesc.includes('food') ||
      lowerDesc.includes('burger') ||
      lowerDesc.includes('pizza') ||
      lowerDesc.includes('coffee')) {
    return "Dining";
  }
  
  // Transportation
  if (lowerDesc.includes('gas') || 
      lowerDesc.includes('fuel') || 
      lowerDesc.includes('petrol') ||
      lowerDesc.includes('taxi') ||
      lowerDesc.includes('uber') ||
      lowerDesc.includes('train') ||
      lowerDesc.includes('transport')) {
    return "Transportation";
  }
  
  // Shopping
  if (lowerDesc.includes('store') || 
      lowerDesc.includes('shop') || 
      lowerDesc.includes('mall') ||
      lowerDesc.includes('retail') ||
      lowerDesc.includes('purchase')) {
    return "Shopping";
  }
  
  // Default category
  return "Other";
};

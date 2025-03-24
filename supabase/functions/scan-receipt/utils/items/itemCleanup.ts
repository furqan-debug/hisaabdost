
// Clean up item text to extract meaningful product names
export function cleanItemText(text: string): string {
  let cleaned = text;
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(item|product|sku|upc)[:.\s]+/i, '');
  
  // Remove quantity indicators (e.g., "2 x", "2X", "(2)")
  cleaned = cleaned.replace(/^\d+\s*[xX]\s*/i, '');
  cleaned = cleaned.replace(/\(\d+\s*[xX]?\)/i, '');
  cleaned = cleaned.replace(/^\d+\s+/, '');
  
  // Remove item codes, SKUs, barcodes
  cleaned = cleaned.replace(/^#\s*\d+\s+/i, '');
  cleaned = cleaned.replace(/^[a-z]{0,3}\d{4,}\s+/i, '');
  
  // Remove prices embedded in the name
  cleaned = cleaned.replace(/\s+\$?\d+\.\d{2}(\s|$)/g, ' ');
  
  // Remove special characters
  cleaned = cleaned.replace(/[*#@]/g, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  
  // Convert common abbreviations
  const abbreviations = {
    'ORG': 'Organic',
    'LRG': 'Large',
    'MED': 'Medium',
    'SM': 'Small',
    'EA': 'Each',
    'PK': 'Pack',
    'W/': 'With'
  };
  
  // Replace abbreviations
  for (const [abbr, full] of Object.entries(abbreviations)) {
    // Use word boundaries to ensure we don't replace parts of words
    const regex = new RegExp(`\\b${abbr}\\b`, 'i');
    cleaned = cleaned.replace(regex, full);
  }
  
  // Capitalize first letter for readability
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }
  
  return cleaned;
}

// Check if the name is likely to be a real product name
export function isLikelyProduct(name: string): boolean {
  if (name.length < 3 || name.length > 50) {
    return false;
  }
  
  // Check for common non-product phrases
  const nonProductPhrases = [
    'total', 'subtotal', 'tax', 'change', 'cash', 'credit', 'debit',
    'balance', 'payment', 'receipt', 'order', 'transaction', 'thank you',
    'discount', 'savings', 'points', 'rewards', 'store number', 'tel',
    'phone', 'call', 'www', 'http', '.com', 'promotion', 'member',
    'cashier', 'terminal', 'customer', 'account', 'loyalty'
  ];
  
  const lowerName = name.toLowerCase();
  for (const phrase of nonProductPhrases) {
    if (lowerName.includes(phrase)) {
      return false;
    }
  }
  
  // A product name typically contains at least one letter
  if (!/[a-z]/i.test(name)) {
    return false;
  }
  
  return true;
}

/**
 * Helper function to clean up an item name specifically for display
 */
export function cleanupItemName(name: string): string {
  let cleanedName = name;
  
  // Remove quantity indicators
  cleanedName = cleanedName.replace(/^\d+\s*[xX]\s*/, '');  // Remove "2 x " prefix
  cleanedName = cleanedName.replace(/^\d+\s+/, '');  // Remove "2 " prefix
  
  // Remove item numbers and SKU codes
  cleanedName = cleanedName.replace(/^#\d+\s*/, ''); // Remove "#123 " prefix
  cleanedName = cleanedName.replace(/\s+\d+$/, '');  // Remove trailing numbers
  cleanedName = cleanedName.replace(/\s{2,}/g, ' ');  // Remove multiple spaces
  
  // Remove special characters at beginning and end
  cleanedName = cleanedName.replace(/^[^a-zA-Z0-9]+/, '');
  cleanedName = cleanedName.replace(/[^a-zA-Z0-9]+$/, '');
  
  // Handle common abbreviations
  cleanedName = cleanedName.replace(/(\b)EA(\b)/i, '$1each$2');
  cleanedName = cleanedName.replace(/(\b)PK(\b)/i, '$1pack$2');
  
  // Make first letter uppercase for better appearance
  if (cleanedName.length > 0) {
    cleanedName = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }
  
  return cleanedName;
}

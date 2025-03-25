
/**
 * Checks if text is likely a non-item text (header, footer, etc.)
 */
export function isNonItemText(text: string): boolean {
  const nonItemKeywords = [
    /subtotal/i, /tax/i, /total/i, /balance/i, /due/i, /change/i, 
    /cash/i, /card/i, /credit/i, /debit/i, /payment/i, 
    /receipt/i, /invoice/i, /thank/i, /you/i, /welcome/i,
    /store/i, /shop/i, /market/i, /date/i, /time/i
  ];
  
  // Check if the text includes any non-item keywords
  for (const pattern of nonItemKeywords) {
    if (pattern.test(text)) {
      return true;
    }
  }
  
  // Check if it's just a number or special characters
  if (/^\s*[\d\W]+\s*$/.test(text)) {
    return true;
  }
  
  return false;
}

/**
 * Removes common prefixes and cleans up item text
 */
export function cleanItemText(text: string): string {
  // Remove item numbers and codes
  let cleaned = text.replace(/^#\d+\s*/, '');
  
  // Remove register/SKU numbers
  cleaned = cleaned.replace(/\[[\w\d\s-]+\]/g, '');
  
  // Clean up asterisks, dashes and other non-alphanumeric
  cleaned = cleaned.replace(/[\*\-]+/, '');
  
  // Consolidate multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Trim leading and trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}


/**
 * Checks if text is likely a non-item text (header, footer, etc.)
 */
export function isNonItemText(text: string): boolean {
  const nonItemKeywords = [
    /subtotal/i, /tax/i, /total/i, /balance/i, /due/i, /change/i, 
    /cash/i, /card/i, /credit/i, /debit/i, /payment/i, 
    /receipt/i, /invoice/i, /thank/i, /you/i, /welcome/i,
    /store/i, /shop/i, /market/i, /date/i, /time/i,
    /order/i, /number/i, /employee/i, /cashier/i, /tel:/i, /tel$/i, /telephone/i,
    /transaction/i, /reference/i, /customer/i, /contact/i, /website/i,
    /visit/i, /www/i, /http/i, /\.com/i, /tel[0-9]/i, /\d{2}[/-]\d{2}[/-]\d{2,4}/
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
  
  // Check for very short text (1-2 characters)
  if (text.trim().length <= 2) {
    return true;
  }
  
  // Check if it's a date or time
  if (/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}$/.test(text) || 
      /^\d{1,2}:\d{2}(:\d{2})?(\s*[AP]M)?$/.test(text)) {
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
  
  // Remove quantity indicators
  cleaned = cleaned.replace(/^\d+\s*[xX]\s*/, '');
  
  // Remove price at the end if it's clearly a price format
  cleaned = cleaned.replace(/\s+\$?\d+\.\d{2}\s*$/, '');
  
  // Consolidate multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Trim leading and trailing whitespace
  cleaned = cleaned.trim();
  
  // Convert to Title Case for consistency
  cleaned = cleaned.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
  
  return cleaned;
}

/**
 * Extracts potential item lines from receipt text
 * @param text Full receipt text
 * @returns Array of potential item lines
 */
export function extractPotentialItems(text: string): string[] {
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Filter out non-item lines
  return lines.filter(line => !isNonItemText(line));
}

/**
 * Attempts to determine if a line has a price at the end
 * @param text Line of text
 * @returns Object with item name and price if found
 */
export function extractPriceFromLine(text: string): { name: string, price: string } | null {
  // Common price patterns at the end of lines
  const pricePatterns = [
    /(.+)\s+\$?(\d+\.\d{2})\s*$/,  // "Item name $10.99"
    /(.+)\s+(\d+\.\d{2})\s*$/,     // "Item name 10.99"
    /(.+)\s+\$\s*(\d+\.\d{2})\s*$/, // "Item name $ 10.99"
    /(.+)\s+\$?(\d+,\d{2})\s*$/    // "Item name $10,99" (comma decimal)
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match && match.length >= 3) {
      return {
        name: cleanItemText(match[1]),
        price: match[2].replace(',', '.') // Normalize comma decimals
      };
    }
  }
  
  return null;
}

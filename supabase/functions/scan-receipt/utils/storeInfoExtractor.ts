
// Functions for extracting store/merchant information from receipt text

// Identify store name from receipt text
export function identifyStoreName(lines: string[]): string {
  // Store names are usually at the top of the receipt
  const MAX_HEADER_LINES = 10;
  
  // Skip very first line if it's too short 
  // (often just has transaction info or star lines)
  const startIndex = lines[0] && lines[0].length < 3 ? 1 : 0;
  
  // First, look for lines without numbers and special characters
  // These are most likely to be store names
  for (let i = startIndex; i < Math.min(MAX_HEADER_LINES, lines.length); i++) {
    // Skip short lines or obvious non-store-name lines
    if (lines[i].length < 3 || shouldSkipLine(lines[i])) {
      continue;
    }
    
    // Clean up and check if this is likely a store name
    const cleanLine = cleanupStoreName(lines[i]);
    if (isLikelyStoreName(cleanLine) && !isProbablyNotStoreName(cleanLine)) {
      return cleanLine;
    }
  }
  
  // Second pass: Look specifically for store in all caps (common format)
  for (let i = startIndex; i < Math.min(MAX_HEADER_LINES, lines.length); i++) {
    const line = lines[i];
    if (line.length >= 3 && 
        line.length < 30 && 
        line === line.toUpperCase() && 
        !shouldSkipLine(line)) {
      return cleanupStoreName(line);
    }
  }
  
  // Third pass: Just take any reasonable line at the top
  for (let i = startIndex; i < Math.min(MAX_HEADER_LINES, lines.length); i++) {
    if (lines[i].length >= 3 && 
        lines[i].length < 40 && 
        !shouldSkipLine(lines[i]) &&
        !isProbablyNotStoreName(lines[i])) {
      return cleanupStoreName(lines[i]);
    }
  }
  
  // Fallback to a generic name if we can't identify a store name
  return "Store Receipt";
}

// Check if a line should be skipped when looking for store names
function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  // Skip lines with common non-store-name patterns
  return lowerLine.includes("receipt") ||
         lowerLine.includes("invoice") ||
         lowerLine.includes("tel:") ||
         lowerLine.includes("telephone") ||
         lowerLine.includes("phone") ||
         lowerLine.includes("fax") ||
         lowerLine.includes("www.") ||
         lowerLine.includes("http") ||
         lowerLine.includes(".com") ||
         lowerLine.includes("welcome") ||
         lowerLine.includes("thank you") ||
         lowerLine.includes("date") ||
         lowerLine.includes("time") ||
         lowerLine.includes("order") ||
         lowerLine.includes("cashier") ||
         lowerLine.includes("customer") ||
         lowerLine.includes("transaction") ||
         lowerLine.includes("terminal") ||
         lowerLine.includes("merchant");
}

// Check if this is likely to be a store name
function isLikelyStoreName(name: string): boolean {
  // Store names are typically not too long, not too short
  if (name.length < 3 || name.length > 40) {
    return false;
  }
  
  // Store names usually don't contain too many numbers
  const numberCount = (name.match(/\d/g) || []).length;
  if (numberCount > 4) {
    return false;
  }
  
  // Store names usually don't have too many special characters
  const specialCharCount = (name.match(/[^\w\s]/g) || []).length;
  if (specialCharCount > 3) {
    return false;
  }
  
  return true;
}

// Clean up the store name
function cleanupStoreName(name: string): string {
  let cleanName = name.trim();
  
  // Remove extra whitespace
  cleanName = cleanName.replace(/\s+/g, ' ');
  
  // Remove common prefixes like "Welcome to"
  cleanName = cleanName.replace(/^welcome\s+to\s+/i, '');
  
  // Remove trailing store numbers like "#123"
  cleanName = cleanName.replace(/\s+#\d+$/, '');
  
  // Remove leading store types like "SUPERMARKET:"
  cleanName = cleanName.replace(/^(store|supermarket|grocery|restaurant|shop|market):\s*/i, '');
  
  // Capitalize properly (not ALL CAPS)
  if (cleanName === cleanName.toUpperCase()) {
    cleanName = cleanName.charAt(0).toUpperCase() + 
                cleanName.slice(1).toLowerCase();
  }
  
  return cleanName;
}

// Extract payment method from receipt text
export function extractPaymentMethod(text: string): string {
  // Convert text to lowercase for easier matching
  const lowerText = text.toLowerCase();
  
  // Check for common payment methods
  if (lowerText.includes("credit card") || 
      lowerText.includes("credit") ||
      lowerText.includes("visa") || 
      lowerText.includes("mastercard") || 
      lowerText.includes("master card") ||
      lowerText.includes("amex") ||
      lowerText.includes("american express")) {
    return "Card";
  }
  
  if (lowerText.includes("debit card") || 
      lowerText.includes("debit")) {
    return "Card";
  }
  
  if (lowerText.includes("cash")) {
    return "Cash";
  }
  
  if (lowerText.includes("apple pay") ||
      lowerText.includes("google pay") ||
      lowerText.includes("samsung pay") ||
      lowerText.includes("mobile payment")) {
    return "Mobile Payment";
  }
  
  // Default to Card as most common payment method
  return "Card";
}

// Check if this text is definitely not a store name
function isProbablyNotStoreName(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for patterns that suggest this isn't a store name
  return lowerText.includes("total") ||
         lowerText.includes("subtotal") ||
         lowerText.includes("tax") ||
         lowerText.includes("qty") ||
         lowerText.includes("price") ||
         lowerText.includes("amount") ||
         lowerText.match(/^\d+$/) !== null ||  // Just numbers
         lowerText.match(/^[\*\-=_]{3,}$/) !== null;  // Just separator chars
}

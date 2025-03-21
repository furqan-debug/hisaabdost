
// Functions for extracting store name and payment method from receipt text

// Extract the store name from receipt text
export function identifyStoreName(lines: string[]): string {
  // Usually the first few lines of a receipt contain the store name
  if (lines.length > 0) {
    // Try to find SUPERMARKET or other store indicators in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const upperLine = lines[i].toUpperCase();
      
      // Look for obvious store names in all caps
      if (upperLine.includes("SUPERMARKET") || 
          upperLine.includes("GROCERY") || 
          upperLine.includes("MARKET") || 
          upperLine.includes("STORE") ||
          upperLine.includes("SHOP")) {
        return lines[i].trim();
      }
      
      // Check for standalone all caps words that could be a store name
      if (upperLine === upperLine.toUpperCase() && 
          upperLine.length > 3 && 
          upperLine.length < 25 &&
          !upperLine.match(/RECEIPT|INVOICE|#\d+|STORE #|TOTAL/)) {
        return upperLine;
      }
    }
    
    // If we found nothing specific, use the very first line as it's often the store name
    if (lines[0].length > 2 && 
        !lines[0].match(/receipt|invoice|tel:|www\.|http|thank|order|date|time/i)) {
      return lines[0].trim();
    }
    
    // Look for store pattern with "#" or "Store #"
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].match(/store\s+#\d+/i)) {
        // Try to find the store name in the previous line
        if (i > 0 && lines[i-1].length > 2) {
          return lines[i-1].trim();
        }
        // If not found in previous line, return this line
        return lines[i].replace(/store\s+#\d+/i, 'Store').trim();
      }
    }
    
    // As a last resort, return "Supermarket" if we see indications it's a grocery receipt
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const lowerLine = lines[i].toLowerCase();
      if (lowerLine.includes("grocery") || 
          lowerLine.includes("produce") || 
          lowerLine.includes("dairy") || 
          lowerLine.includes("meat") || 
          lowerLine.includes("bakery")) {
        return "Supermarket";
      }
    }
    
    // Absolute last resort
    return "Supermarket";
  }
  return "Supermarket";
}

// Extract the payment method from receipt text
export function extractPaymentMethod(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Supermarket-specific payment methods
  if (lowerText.includes('debit card') || lowerText.includes('debit')) {
    return "Debit Card";
  } else if (lowerText.includes('credit card') || 
             lowerText.includes('visa') || 
             lowerText.includes('mastercard') || 
             lowerText.includes('amex')) {
    return "Credit Card";
  } else if (lowerText.includes('cash')) {
    return "Cash";
  } else if (lowerText.includes('apple pay') || lowerText.includes('applepay')) {
    return "Apple Pay";
  } else if (lowerText.includes('google pay') || lowerText.includes('googlepay')) {
    return "Google Pay";
  } else if (lowerText.includes('card')) {
    return "Card";
  } else {
    return "Card"; // Default to Card
  }
}

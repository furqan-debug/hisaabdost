
// Functions for extracting store name and payment method from receipt text

// Extract the store name from receipt text
export function identifyStoreName(lines: string[]): string {
  // Usually the first few lines of a receipt contain the store name
  if (lines.length > 0) {
    // Special case for restaurant receipts - often have logo/name at the very top
    if (lines[0].length > 2 && lines[0].length < 40 && 
        !lines[0].match(/receipt|invoice|tel:|www\.|http|thank|order|date|time|\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}|\d+\.\d{2}|\$\d+\.\d{2}/i)) {
      return lines[0].trim();
    }
    
    // Check more aggressively for restaurant names in the first 5 lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      // Skip lines that are likely not store names
      if (lines[i].match(/receipt|invoice|tel:|www\.|http|thank|order|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\-\d{1,2}\-\d{2,4}|\d+\.\d{2}|\$\d+\.\d{2}/i)) {
        continue;
      }
      
      const line = lines[i].trim();
      if (line.length > 2 && line.length < 40 && !line.match(/^\d/) && line === line.toUpperCase()) {
        return line;
      }
      
      // Take the first line that looks like a name (not too short, not too long)
      if (line.length > 2 && line.length < 40 && !line.match(/^\d+$/)) {
        return line;
      }
    }
    
    // Look for restaurant-specific identifiers
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const lowerLine = lines[i].toLowerCase();
      if (lowerLine.includes("restaurant") || 
          lowerLine.includes("cafe") || 
          lowerLine.includes("bar") || 
          lowerLine.includes("grill") ||
          lowerLine.includes("bistro") ||
          lowerLine.includes("kitchen")) {
        return lines[i].trim();
      }
    }
    
    // If we couldn't find a good name, default to first non-numeric line
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      if (lines[i] && lines[i].trim().length > 0 && !lines[i].match(/^\d+$/)) {
        return lines[i].trim();
      }
    }
    
    // As a last resort, return "Unknown Merchant"
    return "Unknown Merchant";
  }
  return "Unknown Merchant";
}

// Extract the payment method from receipt text
export function extractPaymentMethod(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Restaurant-specific payment methods
  if (lowerText.includes('table service') || lowerText.includes('table charge')) {
    return "Card";
  }
  
  // Regular payment methods
  if (lowerText.includes('credit card') || lowerText.includes('visa') || 
      lowerText.includes('mastercard') || lowerText.includes('amex') ||
      lowerText.includes('credit') || lowerText.includes('mastercard')) {
    return "Credit Card";
  } else if (lowerText.includes('debit') || lowerText.includes('debit card')) {
    return "Debit Card";
  } else if (lowerText.includes('cash')) {
    return "Cash";
  } else if (lowerText.includes('paypal')) {
    return "PayPal";
  } else if (lowerText.includes('apple pay') || lowerText.includes('applepay')) {
    return "Apple Pay";
  } else if (lowerText.includes('google pay') || lowerText.includes('googlepay')) {
    return "Google Pay";
  } else if (lowerText.includes('venmo')) {
    return "Venmo";
  } else if (lowerText.includes('zelle')) {
    return "Zelle";
  } else if (lowerText.includes('card')) {
    return "Card";
  } else {
    return "Card"; // Default to Card instead of Other
  }
}


// Functions for extracting store name and payment method from receipt text

// Extract the store name from receipt text
export function identifyStoreName(lines: string[]): string {
  // Usually the first few lines of a receipt contain the store name
  if (lines.length > 0) {
    // Check if the first line contains "Restaurant" or has a simple name format
    if (lines[0].includes("Restaurant") || 
        (lines[0].length > 2 && lines[0].length < 40 && !lines[0].match(/receipt|invoice|tel:|www\.|http|thank|order|date|time/i))) {
      return lines[0].trim();
    }
    
    // Check for common restaurant/store name patterns in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      // Skip lines that are likely not store names
      if (lines[i].match(/receipt|invoice|tel:|www\.|http|thank|order|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\-\d{1,2}\-\d{2,4}|\d+\.\d{2}|\$\d+\.\d{2}/i)) {
        continue;
      }
      
      // Take the first line that looks like a name (not too short, not too long)
      if (lines[i].length > 2 && lines[i].length < 40) {
        return lines[i].trim();
      }
    }
    
    // If we couldn't find a good name, default to first line or "Restaurant"
    if (lines[0] && lines[0].trim().length > 0) {
      return lines[0].trim();
    }
    return "Restaurant";
  }
  return "Restaurant";
}

// Extract the payment method from receipt text
export function extractPaymentMethod(text: string): string {
  const lowerText = text.toLowerCase();
  
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


// Functions for categorizing store types

/**
 * Get category based on store name
 */
export function getCategoryFromStoreName(storeName: string): string {
  if (!storeName) return "Other";
  
  const lowerName = storeName.toLowerCase();
  
  // Gas station
  if (lowerName.includes('shell') || 
      lowerName.includes('gas') || 
      lowerName.includes('petrol') ||
      lowerName.includes('exxon') ||
      lowerName.includes('mobil') ||
      lowerName.includes('bp') ||
      lowerName.includes('chevron')) {
    return "Transportation";
  }
  
  // Grocery store
  if (lowerName.includes('supermarket') || 
      lowerName.includes('grocery') || 
      lowerName.includes('food') || 
      lowerName.includes('market') || 
      lowerName.includes('mart')) {
    return "Groceries";
  }
  
  // Restaurant
  if (lowerName.includes('restaurant') || 
      lowerName.includes('cafe') || 
      lowerName.includes('bar') || 
      lowerName.includes('grill') || 
      lowerName.includes('diner')) {
    return "Restaurant";
  }
  
  return "Shopping";
}

/**
 * Determine payment method from receipt text
 */
export function determinePaymentMethod(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("credit") || 
      lowerText.includes("visa") || 
      lowerText.includes("mastercard") || 
      lowerText.includes("debit") ||
      lowerText.includes("card")) {
    return "Card";
  }
  
  if (lowerText.includes("cash")) {
    return "Cash";
  }
  
  // Default to Card as most common payment method
  return "Card";
}

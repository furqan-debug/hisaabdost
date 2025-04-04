
/**
 * Formats an amount string to ensure it's a valid number
 */
export function formatSafeAmount(amountString: string): string {
  if (!amountString) return "";
  
  try {
    // Remove any non-numeric characters except for decimal point
    const cleanedAmount = amountString.toString().replace(/[^0-9.]/g, '');
    
    // Parse as float and check if it's a valid number
    const amount = parseFloat(cleanedAmount);
    if (isNaN(amount)) {
      console.warn(`Invalid amount: ${amountString}`);
      return "";
    }
    
    // Return the cleaned amount string
    return cleanedAmount;
  } catch (error) {
    console.error(`Error formatting amount ${amountString}:`, error);
    return "";
  }
}

/**
 * Formats a date string to ensure it's in YYYY-MM-DD format
 */
export function formatSafeDate(dateString: string): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  try {
    // If it's already in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parse date string to Date object
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}, using current date`);
      return new Date().toISOString().split('T')[0];
    }
    
    // Format to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`Error formatting date ${dateString}:`, error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Guesses a category from a description
 */
export function guessCategoryFromDescription(description: string = ""): string {
  if (!description) return "Other";
  
  const desc = description.toLowerCase();
  
  // Simple category matching based on keywords
  if (desc.includes("coffee") || desc.includes("cafe") || desc.includes("restaurant") || 
      desc.includes("burger") || desc.includes("pizza") || desc.includes("food") ||
      desc.includes("dinner") || desc.includes("lunch") || desc.includes("breakfast")) {
    return "Food";
  }
  
  if (desc.includes("gas") || desc.includes("petrol") || desc.includes("fuel") || 
      desc.includes("uber") || desc.includes("lyft") || desc.includes("taxi") ||
      desc.includes("train") || desc.includes("bus") || desc.includes("transit")) {
    return "Transportation";
  }
  
  if (desc.includes("grocery") || desc.includes("supermarket") || desc.includes("market") || 
      desc.includes("walmart") || desc.includes("target") || desc.includes("costco") ||
      desc.includes("food") || desc.includes("shopping")) {
    return "Groceries";
  }
  
  if (desc.includes("amazon") || desc.includes("ebay") || desc.includes("online") || 
      desc.includes("purchase") || desc.includes("buy") || desc.includes("store")) {
    return "Shopping";
  }
  
  if (desc.includes("bill") || desc.includes("utility") || desc.includes("electric") || 
      desc.includes("water") || desc.includes("gas bill") || desc.includes("phone") ||
      desc.includes("internet") || desc.includes("subscription")) {
    return "Bills";
  }
  
  if (desc.includes("entertainment") || desc.includes("movie") || desc.includes("cinema") || 
      desc.includes("theater") || desc.includes("concert") || desc.includes("show")) {
    return "Entertainment";
  }
  
  if (desc.includes("health") || desc.includes("medical") || desc.includes("doctor") || 
      desc.includes("hospital") || desc.includes("pharmacy") || desc.includes("medicine")) {
    return "Healthcare";
  }
  
  // Default category
  return "Other";
}

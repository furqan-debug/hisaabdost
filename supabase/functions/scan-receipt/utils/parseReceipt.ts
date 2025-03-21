
import { extractDate } from "./dateUtils.ts";
import { extractLineItems } from "./itemExtractor.ts";
import { identifyStoreName } from "./storeInfoExtractor.ts";
import { extractTotal } from "./totalExtractor.ts";

// Parse receipt data from extracted text
export function parseReceiptData(text: string): {
  storeName: string;
  date: string;
  items: Array<{name: string; amount: string; category: string}>;
  total: string;
  paymentMethod: string;
} {
  // Convert the text to lines for easier processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("Processing", lines.length, "lines from receipt");
  
  // Check if this is likely a restaurant receipt
  const isRestaurant = isRestaurantReceipt(text);
  console.log("Is this a restaurant receipt?", isRestaurant);
  
  // Extract store/restaurant name from the top of the receipt
  const storeName = identifyStoreName(lines);
  console.log("Extracted store/restaurant name:", storeName);
  
  // Extract date from receipt
  const date = extractDate(lines);
  console.log("Extracted date:", date);
  
  // Extract individual items with their prices
  const items = extractLineItems(lines);
  console.log(`Extracted ${items.length} items from receipt`);
  
  // Clean up items - deduplicate and verify
  const uniqueItems = items.filter(item => {
    const amount = parseFloat(item.amount);
    return !isNaN(amount) && amount > 0 && item.name.length > 1;
  });
  
  // Extract total amount
  const total = extractTotal(lines, uniqueItems);
  console.log("Extracted total:", total);
  
  // Determine payment method
  const paymentMethod = determinePaymentMethod(text);
  console.log("Determined payment method:", paymentMethod);
  
  return {
    storeName,
    date,
    items: uniqueItems,
    total,
    paymentMethod
  };
}

// Check if this is likely a restaurant receipt
function isRestaurantReceipt(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Look for restaurant-specific keywords
  if (lowerText.includes("restaurant") || 
      lowerText.includes("café") ||
      lowerText.includes("cafe") ||
      lowerText.includes("bar") ||
      lowerText.includes("server") || 
      lowerText.includes("table") || 
      lowerText.includes("guest") ||
      lowerText.includes("gratuity") || 
      lowerText.includes("tip") ||
      lowerText.includes("service charge") ||
      lowerText.includes("appetizer") ||
      lowerText.includes("entrée") ||
      lowerText.includes("dessert") ||
      lowerText.includes("beverage")) {
    return true;
  }
  
  return false;
}

// Determine payment method from receipt text
function determinePaymentMethod(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("credit card") || 
      lowerText.includes("credit") ||
      lowerText.includes("visa") || 
      lowerText.includes("mastercard") || 
      lowerText.includes("master card") ||
      lowerText.includes("amex") ||
      lowerText.includes("american express") ||
      lowerText.includes("discover")) {
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
  
  if (lowerText.includes("transfer") || 
      lowerText.includes("wire") ||
      lowerText.includes("bank")) {
    return "Transfer";
  }
  
  // Default to Card as most common payment method
  return "Card";
}

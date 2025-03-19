
import { extractDate } from "./dateUtils.ts";
import { extractLineItems } from "./itemExtractor.ts";
import { identifyStoreName, extractPaymentMethod } from "./storeInfoExtractor.ts";
import { extractTotal } from "./totalExtractor.ts";

// Check if this is likely a restaurant receipt
function isRestaurantReceipt(text: string, lines: string[]): boolean {
  const lowerText = text.toLowerCase();
  
  // Look for restaurant-specific keywords
  if (lowerText.includes("restaurant") || 
      lowerText.includes("server") || 
      lowerText.includes("table") || 
      lowerText.includes("guest") ||
      lowerText.includes("gratuity") || 
      lowerText.includes("tip") ||
      lowerText.includes("menu") ||
      lowerText.includes("food") ||
      lowerText.includes("dining")) {
    return true;
  }
  
  // Check for menu item patterns with quantity prefixes
  const menuItemPattern = /^\s*\d+\s+[A-Za-z\s\&\-\']+\s+\$\s*\d+\.\d{2}\s*$/;
  let menuItemCount = 0;
  
  for (const line of lines) {
    if (line.match(menuItemPattern)) {
      menuItemCount++;
    }
  }
  
  // If we found multiple lines that look like menu items
  if (menuItemCount >= 2) {
    return true;
  }
  
  return false;
}

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
  console.log("Processing lines:", lines.slice(0, 10), "... and", lines.length - 10, "more lines");
  
  // Check if this is a restaurant receipt
  const isRestaurant = isRestaurantReceipt(text, lines);
  console.log("Is this a restaurant receipt?", isRestaurant);
  
  // Extract store/restaurant name
  const storeName = identifyStoreName(lines);
  console.log("Extracted store/restaurant name:", storeName);
  
  // Extract date - look for date patterns
  let date = extractDate(lines);
  console.log("Extracted date:", date);
  
  // Extract individual items and their prices with improved pattern matching
  const items = extractLineItems(lines);
  console.log("Extracted items:", items);
  
  // If no items were extracted, create some sample items
  if (items.length === 0) {
    console.warn("No items could be extracted from the receipt text, creating fallback item");
    
    // For restaurant receipts, create a single "Restaurant Meal" item
    if (isRestaurant) {
      items.push({ 
        name: "Restaurant Meal", 
        amount: "0.00", 
        category: "Restaurant" 
      });
    } else {
      items.push({ 
        name: "Store Item", 
        amount: "0.00", 
        category: "Shopping" 
      });
    }
  }
  
  // Clean up items - deduplicate and verify
  const uniqueItems = deduplicateItems(items);
  
  // Extract total amount
  const total = extractTotal(lines, uniqueItems);
  console.log("Extracted total:", total);
  
  // Guess payment method
  const paymentMethod = extractPaymentMethod(text);
  console.log("Extracted payment method:", paymentMethod);
  
  // Verify we have a date, or use today's date
  if (!date || date === "Invalid Date") {
    date = new Date().toISOString().split('T')[0];
  }
  
  return {
    storeName,
    date,
    items: uniqueItems,
    total,
    paymentMethod
  };
}

// Remove duplicate items and filter out invalid ones
function deduplicateItems(items: Array<{name: string; amount: string; category: string}>): 
  Array<{name: string; amount: string; category: string}> {
  
  // First filter out items with invalid amounts
  const validItems = items.filter(item => {
    const amount = parseFloat(item.amount);
    return !isNaN(amount) && amount > 0 && item.name.length > 1;
  });
  
  // Create a Map to track unique items
  const uniqueMap = new Map<string, {name: string; amount: string; category: string}>();
  
  // For items with the same name, keep the one with the higher amount
  validItems.forEach(item => {
    const key = item.name.toLowerCase();
    
    if (!uniqueMap.has(key) || 
        parseFloat(item.amount) > parseFloat(uniqueMap.get(key)!.amount)) {
      uniqueMap.set(key, item);
    }
  });
  
  // Convert back to array
  return Array.from(uniqueMap.values());
}

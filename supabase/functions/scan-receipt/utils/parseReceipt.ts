
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
  
  // Extract store name from the top of the receipt
  const storeName = identifyStoreName(lines);
  console.log("Extracted store/restaurant name:", storeName);
  
  // Extract date from receipt
  const date = extractDate(lines);
  console.log("Extracted date:", date);
  
  // Extract individual items with their prices
  const items = extractLineItems(lines);
  console.log(`Extracted ${items.length} items from receipt`);
  
  // Make sure items have valid values
  const validItems = items.filter(item => {
    const amount = parseFloat(item.amount);
    return !isNaN(amount) && amount > 0 && item.name.length > 1;
  });
  
  // Extract total amount
  const total = extractTotal(lines, validItems);
  console.log("Extracted total:", total);
  
  // Determine payment method
  const paymentMethod = determinePaymentMethod(text);
  console.log("Determined payment method:", paymentMethod);
  
  return {
    storeName,
    date,
    items: validItems,
    total,
    paymentMethod
  };
}

// Determine payment method from receipt text - simplified version
function determinePaymentMethod(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("credit") || 
      lowerText.includes("visa") || 
      lowerText.includes("mastercard") || 
      lowerText.includes("debit")) {
    return "Card";
  }
  
  if (lowerText.includes("cash")) {
    return "Cash";
  }
  
  // Default to Card as most common payment method
  return "Card";
}

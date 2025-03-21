
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
  
  // Extract store name from the top of the receipt - prioritize uppercase words at the top
  let storeName = "";
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].toUpperCase() === lines[i] && lines[i].length > 3) {
      storeName = lines[i];
      break;
    }
  }
  
  // If no all-caps name found, use the store name extractor
  if (!storeName) {
    storeName = identifyStoreName(lines);
  }
  
  console.log("Extracted store/restaurant name:", storeName);
  
  // Extract date from receipt
  const date = extractDate(lines);
  console.log("Extracted date:", date);
  
  // Extract individual items with their prices - this is the critical part for our fix
  const items = extractLineItems(lines);
  console.log(`Extracted ${items.length} items from receipt`);
  
  // Make sure items have valid values
  const validItems = items.filter(item => {
    const amount = parseFloat(item.amount);
    return !isNaN(amount) && amount > 0 && item.name.length > 1;
  });
  
  // Extract total amount by looking for "TOTAL" followed by an amount
  let total = "0.00";
  
  // Look for explicit TOTAL line
  for (let i = Math.floor(lines.length * 0.5); i < lines.length; i++) {
    const line = lines[i];
    if (line.toUpperCase().includes("TOTAL")) {
      // Try to extract amount using regex
      const matches = line.match(/.*?(\d+\.\d{2})$/);
      if (matches && matches[1]) {
        total = matches[1];
        console.log("Extracted total from 'TOTAL' line:", total);
        break;
      }
    }
  }
  
  // If we couldn't find an explicit total, try to find a standalone price near the end
  if (total === "0.00") {
    for (let i = lines.length - 1; i >= Math.floor(lines.length * 0.7); i--) {
      const line = lines[i].trim();
      // Look for a line that only contains a price
      const totalMatch = line.match(/^\$?\s*(\d+\.\d{2})$/);
      if (totalMatch) {
        total = totalMatch[1];
        console.log("Extracted total from standalone price near end:", total);
        break;
      }
    }
  }
  
  // If we still don't have a total, use the utility function
  if (total === "0.00") {
    total = extractTotal(lines, validItems);
    console.log("Extracted total using fallback method:", total);
  }
  
  // Calculate total from items if we still don't have it
  if (total === "0.00" && validItems.length > 0) {
    const calculatedTotal = validItems
      .reduce((sum, item) => sum + parseFloat(item.amount), 0)
      .toFixed(2);
    total = calculatedTotal;
    console.log("Calculated total from items:", total);
  }
  
  console.log("Final extracted total:", total);
  
  // Determine payment method from receipt text
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

// Determine payment method from receipt text
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

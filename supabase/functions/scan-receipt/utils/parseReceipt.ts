
import { extractDate } from "./dateUtils.ts";
import { extractLineItems } from "./itemExtractor.ts";
import { identifyStoreName, extractPaymentMethod } from "./storeInfoExtractor.ts";
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
  console.log("Processing lines:", lines.slice(0, 10), "... and", lines.length - 10, "more lines");
  
  // Extract store name (usually at the top of the receipt)
  const storeName = identifyStoreName(lines);
  
  // Extract date - look for date patterns
  let date = extractDate(lines);
  
  // Extract individual items and their prices with improved pattern matching
  const items = extractLineItems(lines);
  
  // If no items were extracted, create some sample items
  if (items.length === 0) {
    console.warn("No items could be extracted from the receipt text, creating sample items");
    items.push(
      { name: "Unknown Item 1", amount: "0.00", category: "Shopping" },
      { name: "Unknown Item 2", amount: "0.00", category: "Shopping" }
    );
  }
  
  // Extract total amount
  const total = extractTotal(lines, items);
  
  // Guess payment method
  const paymentMethod = extractPaymentMethod(text);
  
  return {
    storeName,
    date,
    items,
    total,
    paymentMethod
  };
}


import { extractDate } from "./dateUtils.ts";
import { extractLineItems } from "./itemExtractor.ts";
import { identifyStoreName } from "./storeInfoExtractor.ts";
import { extractTotal } from "./totalExtractor.ts";
import { determineReceiptType } from "./receiptTypes/receiptTypeDetector.ts";
import { extractGasReceiptItems } from "./receiptTypes/gasReceiptHandler.ts";
import { getCategoryFromStoreName, determinePaymentMethod } from "./categorization/storeCategorizer.ts";

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
  
  // Extract store name from the receipt
  const storeName = identifyStoreName(lines);
  console.log("Extracted store/restaurant name:", storeName);
  
  // Extract date from receipt
  const date = extractDate(lines);
  console.log("Extracted date:", date);
  
  // Determine receipt type for specialized handling
  const receiptType = determineReceiptType(lines, storeName);
  console.log("Determined receipt type:", receiptType);
  
  let items = [];
  let total = "0.00";
  
  if (receiptType === "gas") {
    // Handle gas receipt specifically
    items = extractGasReceiptItems(lines, storeName);
    total = extractTotal(lines, items);
  } else {
    // Extract individual items with their prices - the critical part
    items = extractLineItems(lines);
    console.log(`Extracted ${items.length} items from receipt`);
    
    // Make sure items have valid values
    const validItems = items.filter(item => {
      const amount = parseFloat(item.amount);
      return !isNaN(amount) && amount > 0 && item.name.length > 1;
    });
    
    console.log(`Filtered to ${validItems.length} valid items`);
    items = validItems;
    
    // Extract total amount
    total = extractTotal(lines, validItems);
    console.log("Extracted total:", total);
  }
  
  // If we couldn't find a total, calculate it from items
  if (total === "0.00" && items.length > 0) {
    const calculatedTotal = items
      .reduce((sum, item) => sum + parseFloat(item.amount), 0)
      .toFixed(2);
    total = calculatedTotal;
    console.log("Calculated total from items:", total);
  }
  
  // If we still have no items but have a total, create a generic item
  if (items.length === 0 && parseFloat(total) > 0) {
    const category = getCategoryFromStoreName(storeName);
    items = [{
      name: `Purchase from ${storeName || 'store'}`,
      amount: total,
      category: category
    }];
    console.log("Created generic item for total:", items[0]);
  }
  
  // Determine payment method from receipt text
  const paymentMethod = determinePaymentMethod(text);
  console.log("Determined payment method:", paymentMethod);
  
  return {
    storeName,
    date,
    items,
    total,
    paymentMethod
  };
}


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

// Determine payment method from receipt text
function determinePaymentMethod(text: string): string {
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

// Determine type of receipt for specialized handling
function determineReceiptType(lines: string[], storeName: string): string {
  const fullText = lines.join(' ').toLowerCase();
  
  // Check for gas station keywords
  if (storeName.toLowerCase().includes('shell') || 
      storeName.toLowerCase().includes('gas') ||
      storeName.toLowerCase().includes('petrol') ||
      storeName.toLowerCase().includes('exxon') ||
      storeName.toLowerCase().includes('mobil') ||
      storeName.toLowerCase().includes('bp') ||
      storeName.toLowerCase().includes('chevron') ||
      fullText.includes('fuel') || 
      fullText.includes('gas') ||
      fullText.includes('litres') ||
      fullText.includes('gallons') ||
      fullText.includes('pump')) {
    return "gas";
  }
  
  // Check for restaurant keywords
  if (storeName.toLowerCase().includes('restaurant') ||
      storeName.toLowerCase().includes('cafe') ||
      storeName.toLowerCase().includes('bar') ||
      storeName.toLowerCase().includes('grill') ||
      fullText.includes('server') ||
      fullText.includes('table') ||
      fullText.includes('tip') ||
      fullText.includes('gratuity')) {
    return "restaurant";
  }
  
  // Default to general retail
  return "retail";
}

// Extract items from a gas receipt
function extractGasReceiptItems(lines: string[], storeName: string): Array<{name: string; amount: string; category: string}> {
  const items = [];
  let fuelAmount = "0.00";
  let fuelType = "Fuel";
  let liters = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Look for price indicator
    if (line.includes('price') || line.includes('amount') || line.includes('total')) {
      const priceMatch = lines[i].match(/[$]?(\d+\.\d{2})/);
      if (priceMatch) {
        fuelAmount = priceMatch[1];
      }
    }
    
    // Look for fuel type
    if (line.includes('unleaded') || 
        line.includes('diesel') || 
        line.includes('premium') || 
        line.includes('regular') ||
        line.includes('supreme') ||
        line.includes('e10') ||
        line.includes('ethanol')) {
      fuelType = lines[i].replace(/\d+/g, '').trim();
    }
    
    // Look for bronze/silver/gold indicators (common for fuel types)
    if (line.includes('bronze') || 
        line.includes('silver') || 
        line.includes('gold') ||
        line.includes('platinum')) {
      fuelType = lines[i].trim();
    }
    
    // Look for volume
    if (line.includes('litre') || 
        line.includes('liter') || 
        line.includes('gallon') ||
        line.includes('l:') ||
        line.includes('litres:')) {
      const volumeMatch = lines[i].match(/(\d+\.\d+)/);
      if (volumeMatch) {
        liters = volumeMatch[1];
      }
    }
  }
  
  // Create the fuel item with all information
  let fuelName = fuelType;
  if (liters) {
    fuelName += ` (${liters} L)`;
  }
  
  if (parseFloat(fuelAmount) > 0) {
    items.push({
      name: fuelName,
      amount: fuelAmount,
      category: "Transportation"
    });
  }
  
  // Look for additional purchases at the gas station
  for (let i = 0; i < lines.length; i++) {
    // Skip lines that clearly aren't item descriptions
    if (shouldSkipLine(lines[i])) continue;
    
    // Look for price pattern at the end of a line
    const priceMatch = lines[i].match(/(.+)\s+[$]?(\d+\.\d{2})$/);
    if (priceMatch && parseFloat(priceMatch[2]) > 0 && !isFuelLine(priceMatch[1].toLowerCase())) {
      items.push({
        name: priceMatch[1].trim(),
        amount: priceMatch[2],
        category: "Shopping" // Most gas station purchases are convenience items
      });
    }
  }
  
  return items;
}

// Helper to determine if a line should be skipped in parsing
function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  return lowerLine.includes('total') ||
         lowerLine.includes('subtotal') ||
         lowerLine.includes('tax') ||
         lowerLine.includes('gst') ||
         lowerLine.includes('hst') ||
         lowerLine.includes('change') ||
         lowerLine.includes('cash') ||
         lowerLine.includes('card') ||
         lowerLine.includes('payment') ||
         lowerLine.includes('store') ||
         lowerLine.includes('date') ||
         lowerLine.includes('time') ||
         lowerLine.includes('receipt') ||
         lowerLine.includes('thank you') ||
         lowerLine.includes('pump no') ||
         lowerLine.includes('tran');
}

// Check if a line is related to fuel
function isFuelLine(line: string): boolean {
  return line.includes('fuel') ||
         line.includes('gas') ||
         line.includes('diesel') ||
         line.includes('unleaded') ||
         line.includes('premium') ||
         line.includes('regular') ||
         line.includes('litre') ||
         line.includes('liter') ||
         line.includes('gallon') ||
         line.includes('pump');
}

// Get category based on store name
function getCategoryFromStoreName(storeName: string): string {
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

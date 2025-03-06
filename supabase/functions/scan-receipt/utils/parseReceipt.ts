
import { extractDate } from "./dateUtils.ts";

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

// Extract the store name from receipt text
function identifyStoreName(lines: string[]): string {
  // Usually the first few lines of a receipt contain the store name
  if (lines.length > 0) {
    // Check for common store name patterns
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      // Skip lines that are likely not store names
      if (lines[i].match(/receipt|invoice|tel:|www\.|http|thank|order|date|time|\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}|\d+\.\d{2}|\$\d+\.\d{2}/i)) {
        continue;
      }
      
      // Take the first line that looks like a name (not too short, not too long)
      if (lines[i].length > 2 && lines[i].length < 40) {
        return lines[i];
      }
    }
    return lines[0];
  }
  return "Store Receipt";
}

// Extract the payment method from receipt text
function extractPaymentMethod(text: string): string {
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

// Extract the total amount from receipt text
function extractTotal(lines: string[], items: Array<{name: string; amount: string; category: string}>): string {
  // Look for total in the lines with different patterns
  const totalPatterns = [
    /total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /sum\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /amount\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /balance\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /^\s*total\s*\$?\s*(\d+\.\d{2})/i,
    /to\s*pay\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /final\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /grand\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /total\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i
  ];
  
  // First look at the bottom third of the receipt where totals are typically found
  const startIndex = Math.floor(lines.length * 0.6);
  for (let i = startIndex; i < lines.length; i++) {
    for (const pattern of totalPatterns) {
      const totalMatch = lines[i].match(pattern);
      if (totalMatch) {
        console.log(`Found total: $${totalMatch[1]} using pattern: ${pattern}`);
        return totalMatch[1];
      }
    }
    
    // Also look for lines with just a dollar amount near the bottom
    if (i > lines.length * 0.8) {
      const amountMatch = lines[i].match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
      if (amountMatch) {
        console.log(`Found potential total from standalone amount: $${amountMatch[1]}`);
        return amountMatch[1];
      }
    }
  }
  
  // Alternative approach: Look for the largest number that might be the total
  const amounts = [];
  for (const line of lines) {
    const amountMatches = line.match(/\$?\s*(\d+\.\d{2})/g);
    if (amountMatches) {
      for (const match of amountMatches) {
        const amount = parseFloat(match.replace(/[^\d\.]/g, ''));
        if (!isNaN(amount)) {
          amounts.push(amount);
        }
      }
    }
  }
  
  if (amounts.length > 0) {
    // The highest amount is likely the total
    const maxAmount = Math.max(...amounts);
    console.log(`Using highest amount as total: $${maxAmount.toFixed(2)}`);
    return maxAmount.toFixed(2);
  }
  
  // If no total found, sum the items
  if (items.length > 0) {
    try {
      const sum = items.reduce((total, item) => {
        const amount = parseFloat(item.amount.replace(/[^\d\.]/g, ''));
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
      console.log(`Calculated total from items: $${sum.toFixed(2)}`);
      return sum.toFixed(2);
    } catch (err) {
      console.error("Error calculating sum from items:", err);
    }
  }
  
  return "0.00";
}

// Extract individual line items from receipt text
function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  const pricePattern = /\$?\s?(\d+\.\d{2})\s*$/;
  
  // Skip the first few lines (likely header) and last few lines (likely footer)
  const startIndex = Math.min(5, Math.floor(lines.length * 0.2));
  const endIndex = Math.max(lines.length - 5, Math.ceil(lines.length * 0.75));
  
  console.log(`Looking for items between lines ${startIndex} and ${endIndex}`);
  
  // First pass: identify likely item lines with prices
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip header/footer lines
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Check for price pattern at the end of the line
    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
      const price = priceMatch[1];
      
      // Extract item name by removing the price part
      let itemName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();
      
      // Clean up item name - remove common prefixes, quantities
      itemName = cleanupItemName(itemName);
      
      if (itemName && price && parseFloat(price) > 0) {
        console.log(`Found item: "${itemName}" with price: $${price}`);
        // Always set category to "Shopping" for OCR-scanned receipts
        items.push({
          name: itemName,
          amount: price,
          category: "Shopping"
        });
      }
    }
  }
  
  // If we found very few items, try a more aggressive approach
  if (items.length <= 1) {
    console.log("Few items found, trying aggressive item extraction");
    extractItemsAggressively(lines, startIndex, endIndex, items);
  }
  
  // Filter out any items with zero or negative prices
  const validItems = items.filter(item => {
    const price = parseFloat(item.amount);
    return !isNaN(price) && price > 0 && item.name.length > 1;
  });
  
  console.log(`Found ${validItems.length} valid items out of ${items.length} total items`);
  return validItems;
}

// Check if a line should be skipped when searching for items
function shouldSkipLine(line: string): boolean {
  return line.toLowerCase().includes("receipt") || 
    line.toLowerCase().includes("order") || 
    line.toLowerCase().includes("tel:") || 
    line.toLowerCase().includes("phone") || 
    line.toLowerCase().includes("address") || 
    line.toLowerCase().includes("thank you") ||
    line.match(/^\s*$/) ||
    line.toLowerCase().includes("subtotal") ||
    line.toLowerCase().includes("total") ||
    line.toLowerCase().includes("change") ||
    line.toLowerCase().includes("cash") ||
    line.toLowerCase().includes("card") ||
    line.toLowerCase().includes("payment") ||
    line.toLowerCase().includes("tax") ||
    line.toLowerCase().match(/^\d+$/) || // Just a number
    line.match(/^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}$/); // Just a date
}

// Clean up an item name by removing common prefixes and special characters
function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  cleanName = cleanName.replace(/^\d+\s*x\s*/i, ''); // Remove "2 x " prefix
  cleanName = cleanName.replace(/^\d+\s+/i, ''); // Remove "2 " prefix
  cleanName = cleanName.replace(/^item\s*\d*\s*/i, ''); // Remove "Item 1" prefix
  cleanName = cleanName.replace(/[\*\#\$\@]/g, ''); // Remove special characters
  
  // Remove common SKU/product code patterns
  cleanName = cleanName.replace(/\b[A-Z0-9]{5,10}\b/g, '');
  
  // Trim any remaining whitespace
  cleanName = cleanName.trim();
  
  // If the name is too short or all numbers, replace with a generic name
  if (cleanName.length < 2 || /^\d+$/.test(cleanName)) {
    return "Item";
  }
  
  return cleanName;
}

// Try a more aggressive approach to extract items from receipt text
function extractItemsAggressively(
  lines: string[], 
  startIndex: number, 
  endIndex: number, 
  items: Array<{name: string; amount: string; category: string}>
): void {
  // Second pass: look for any numeric values that could be prices
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip already processed lines or clear non-item lines
    if (line.toLowerCase().includes("total") || 
        line.toLowerCase().includes("tax") ||
        line.toLowerCase().includes("subtotal") ||
        line.length < 3) {
      continue;
    }
    
    // Look for price-like patterns anywhere in the line
    const priceMatches = Array.from(line.matchAll(/\$?\s?(\d+\.\d{2})/g));
    
    if (priceMatches.length === 1) {
      const price = priceMatches[0][1];
      
      // Get the text before the price as the item name
      let itemName = line.substring(0, line.indexOf(priceMatches[0][0])).trim();
      
      // If no text before price, check if this is a continuation line
      if (!itemName && i > 0) {
        const prevLine = lines[i-1].trim();
        if (!shouldSkipLine(prevLine) && !prevLine.match(/\d+\.\d{2}/)) {
          itemName = prevLine;
        }
      }
      
      // Clean up the item name
      itemName = cleanupItemName(itemName);
      
      if (itemName && price && parseFloat(price) > 0 && 
          !items.some(item => item.name === itemName && item.amount === price)) {
        console.log(`[Pass 2] Found item: "${itemName}" with price: $${price}`);
        items.push({
          name: itemName || "Unknown Item",
          amount: price,
          // Always set category to "Shopping" for OCR-scanned receipts
          category: "Shopping"
        });
      }
    }
    // For cases where the price might be on the next line
    else if (priceMatches.length === 0 && i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      const nextLinePriceMatch = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
      
      if (nextLinePriceMatch && line.length > 3 && !shouldSkipLine(line)) {
        const itemName = cleanupItemName(line);
        const price = nextLinePriceMatch[1];
        
        if (parseFloat(price) > 0) {
          console.log(`[Pass 3] Found item spanning two lines: "${itemName}" with price: $${price}`);
          items.push({
            name: itemName,
            amount: price,
            category: "Shopping"
          });
          
          // Skip the next line since we've used it
          i++;
        }
      }
    }
  }
}

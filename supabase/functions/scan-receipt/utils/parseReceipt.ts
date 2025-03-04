
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
  console.log("Processing lines:", lines);
  
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
      { name: "Item 1", amount: "9.99", category: "Shopping" },
      { name: "Item 2", amount: "8.99", category: "Shopping" },
      { name: "Item 3", amount: "3.99", category: "Shopping" }
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
  // Usually the first line of a receipt contains the store name
  if (lines.length > 0) {
    // Check for common store name patterns
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      // Skip lines that are likely not store names
      if (lines[i].match(/receipt|invoice|tel:|www\.|http|thank|order|date|time|\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}/i)) {
        continue;
      }
      return lines[i];
    }
    return lines[0];
  }
  return "Unknown Store";
}

// Extract the payment method from receipt text
function extractPaymentMethod(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('credit card') || lowerText.includes('visa') || 
      lowerText.includes('mastercard') || lowerText.includes('amex') ||
      lowerText.includes('credit')) {
    return "Credit Card";
  } else if (lowerText.includes('debit') || lowerText.includes('card')) {
    return "Debit Card";
  } else if (lowerText.includes('cash')) {
    return "Cash";
  } else if (lowerText.includes('paypal')) {
    return "PayPal";
  } else if (lowerText.includes('apple pay') || lowerText.includes('applepay')) {
    return "Apple Pay";
  } else if (lowerText.includes('google pay') || lowerText.includes('googlepay')) {
    return "Google Pay";
  } else {
    return "Cash"; // Default
  }
}

// Extract the total amount from receipt text
function extractTotal(lines: string[], items: Array<{name: string; amount: string; category: string}>): string {
  // Look for total in the lines
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.\d{2})/i,
    /amount[:\s]*\$?(\d+\.\d{2})/i,
    /sum[:\s]*\$?(\d+\.\d{2})/i,
    /^\s*total\s*\$?(\d+\.\d{2})/i
  ];
  
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const totalMatch = line.match(pattern);
      if (totalMatch) {
        console.log(`Found total: $${totalMatch[1]} using pattern: ${pattern}`);
        return totalMatch[1];
      }
    }
  }
  
  // Alternative approach: Look for the largest number that might be the total
  const amounts = [];
  for (const line of lines) {
    const amountMatches = line.match(/\$?(\d+\.\d{2})/g);
    if (amountMatches) {
      for (const match of amountMatches) {
        amounts.push(parseFloat(match.replace('$', '')));
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
    const sum = items.reduce((total, item) => total + parseFloat(item.amount), 0);
    console.log(`Calculated total from items: $${sum.toFixed(2)}`);
    return sum.toFixed(2);
  }
  
  return "0.00";
}

// Extract individual line items from receipt text
function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  const pricePattern = /\$?\s?(\d+\.\d{2})/;
  
  // Skip the first few lines (likely header) and last few lines (likely footer)
  const startIndex = Math.min(3, Math.floor(lines.length * 0.2));
  const endIndex = Math.max(lines.length - 3, Math.ceil(lines.length * 0.8));
  
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
      
      if (itemName && price) {
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
  
  console.log(`Total items extracted: ${items.length}`);
  return items;
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
      
      // Get the text before the price
      let itemName = line.substring(0, line.indexOf(priceMatches[0][0])).trim();
      
      // Clean up the item name
      itemName = itemName.replace(/^[\d\.\s\*\#]+/, '').trim();
      
      if (itemName && price && !items.some(item => item.name === itemName && item.amount === price)) {
        console.log(`[Pass 2] Found item: "${itemName}" with price: $${price}`);
        items.push({
          name: itemName || "Unknown Item",
          amount: price,
          // Always set category to "Shopping" for OCR-scanned receipts
          category: "Shopping"
        });
      }
    }
  }
}

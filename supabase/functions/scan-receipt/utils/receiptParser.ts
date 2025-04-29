
// Import helper functions from the existing utilities
import { extractDate } from "./dateExtractor.ts";
import { extractStoreName } from "./storeExtractor.ts";

export interface ReceiptItem {
  name: string;
  amount: string;
}

export interface ParsedReceipt {
  merchant: string;
  date: string;
  total: string;
  items: ReceiptItem[];
}

/**
 * Parses receipt text and extracts relevant information
 */
export function parseReceiptText(text: string): ParsedReceipt {
  if (!text || typeof text !== 'string') {
    return {
      merchant: 'Unknown',
      date: new Date().toISOString().split('T')[0],
      total: '0.00',
      items: []
    };
  }

  // Split text into lines and clean them
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract store name using the utility function
  const merchant = extractStoreName(lines) || 'Unknown';
  
  // Extract date using the utility function - always defaulting to today
  const currentDate = new Date().toISOString().split('T')[0];
  const date = extractDate(text, lines) || currentDate;
  console.log(`Date extraction result: ${date}, is default date: ${date === currentDate}`);
  
  // Extract items and total amount
  const { items, total } = extractItemsAndTotal(text, lines);
  
  // If no items found, create a default one based on merchant
  if (items.length === 0) {
    items.push({
      name: `Purchase from ${merchant}`,
      amount: total
    });
  }
  
  return {
    merchant,
    date,
    total,
    items
  };
}

/**
 * Extracts items and total amount from receipt text
 */
function extractItemsAndTotal(text: string, lines: string[]): { 
  items: ReceiptItem[]; 
  total: string 
} {
  const items: ReceiptItem[] = [];
  let total = '0.00';
  
  // Look for totals first to establish the receipt format
  let totalLine = -1;
  const totalPatterns = [
    /total\s*[\$€£]?\s*(\d+[\.,]\d{2})/i,
    /sum\s*[\$€£]?\s*(\d+[\.,]\d{2})/i,
    /amount\s*[\$€£]?\s*(\d+[\.,]\d{2})/i,
    /[\$€£]?(\d+[\.,]\d{2})\s*total/i
  ];
  
  // Search for total from bottom to top
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].toLowerCase();
    
    if (line.includes('total') || line.includes('sum') || line.includes('amount')) {
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          total = match[1].replace(',', '.');
          totalLine = i;
          break;
        }
      }
      
      if (totalLine >= 0) break;
      
      // Try simple number extraction if pattern matching fails
      const amountMatch = line.match(/[\$€£]?\s*(\d+[\.,]\d{2})/);
      if (amountMatch && amountMatch[1]) {
        total = amountMatch[1].replace(',', '.');
        totalLine = i;
        break;
      }
    }
  }
  
  // Identify likely item lines by looking for patterns like:
  // - Description followed by price
  // - Quantity x item at price
  // - Item with price separated by spaces or tabs
  const itemPatterns = [
    /^(.+?)[\s\t]{2,}[\$€£]?(\d+[\.,]\d{2})$/,                   // Item    $10.99
    /^(.+?)[\s\t]+[\$€£]?(\d+[\.,]\d{2})$/,                       // Item $10.99
    /^(\d+)\s*[xX]\s*(.+?)[\s\t]+[\$€£]?(\d+[\.,]\d{2})$/,        // 2 x Item $10.99
    /^(.+?)[\s\t]*[\$€£]?(\d+[\.,]\d{2})[\s\t]*$/                 // Item$10.99
  ];
  
  // Search for items (usually before the total line)
  const endLine = totalLine >= 0 ? totalLine : lines.length;
  let startLine = 0;
  
  // Skip header lines (usually the first few lines contain store info, address, etc.)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].match(/^(item|description|qty|quantity|price)/i)) {
      startLine = i + 1;
      break;
    }
  }
  
  // Process potential item lines
  for (let i = startLine; i < endLine; i++) {
    const line = lines[i].trim();
    
    // Skip short lines, likely not items
    if (line.length < 3) continue;
    
    // Skip lines that are likely headers or footers
    if (line.match(/^(subtotal|tax|discount|date|time|receipt|customer|card|cash|change)/i)) {
      continue;
    }
    
    // Try all item patterns
    let itemFound = false;
    
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      
      if (match) {
        if (match.length === 3) {
          // Simple item and price
          const name = match[1].trim();
          const price = match[2].replace(',', '.');
          
          // Skip if this looks like a date or non-item
          if (name.match(/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/) || 
              name.length < 2 || 
              name.match(/^[0-9]+$/)) {
            continue;
          }
          
          items.push({ name, amount: price });
          itemFound = true;
          break;
        } else if (match.length === 4) {
          // Quantity x item and price
          const quantity = parseInt(match[1]);
          const name = match[2].trim();
          const price = match[3].replace(',', '.');
          
          // Add quantity indicator to name if more than 1
          const itemName = quantity > 1 ? `${name} (${quantity}x)` : name;
          items.push({ name: itemName, amount: price });
          itemFound = true;
          break;
        }
      }
    }
    
    // If no patterns matched, try a more generic approach for lines with numbers
    if (!itemFound) {
      // Look for price at the end of the line
      const priceMatch = line.match(/.*?[\s\t]+[\$€£]?(\d+[\.,]\d{2})[\s\t]*$/);
      
      if (priceMatch) {
        const price = priceMatch[1].replace(',', '.');
        // Get everything before the price as the item name
        let name = line.substring(0, line.lastIndexOf(priceMatch[1])).trim();
        
        // Remove currency symbols from name
        name = name.replace(/[\$€£]/g, '').trim();
        
        // Ensure we're not picking up non-items
        if (name.length > 2 && !name.match(/^(subtotal|tax|discount|date|time)/i)) {
          items.push({ name, amount: price });
        }
      }
    }
  }
  
  // If we couldn't find a total but have items, use the sum of items
  if (total === '0.00' && items.length > 0) {
    const sum = items.reduce((acc, item) => {
      return acc + parseFloat(item.amount);
    }, 0);
    total = sum.toFixed(2);
  }
  
  return { items, total };
}

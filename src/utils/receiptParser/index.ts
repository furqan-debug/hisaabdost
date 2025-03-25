
import { isNonItemText, cleanItemText, extractPotentialItems, extractPriceFromLine } from './utils';

interface ReceiptItem {
  name: string;
  amount: string;
}

interface ParsedReceipt {
  merchant: string;
  date: string;
  total: string;
  items: ReceiptItem[];
}

/**
 * Parses receipt text and extracts relevant information
 * @param text Receipt text content
 * @returns Parsed receipt data
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
  
  // Extract merchant name from the first few lines
  let merchant = 'Unknown';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (!isNonItemText(lines[i]) && lines[i].length > 3) {
      merchant = lines[i];
      break;
    }
  }
  
  // Look for date in common formats
  let date = new Date().toISOString().split('T')[0];
  const dateRegex = /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      // Try to parse the date, but use today's date as fallback
      try {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        // Add 2000 to 2-digit years if needed
        const fullYear = year < 100 ? year + 2000 : year;
        
        // Create date in YYYY-MM-DD format
        const dateObj = new Date(fullYear, month - 1, day);
        if (!isNaN(dateObj.getTime())) {
          date = dateObj.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
      break;
    }
  }
  
  // Extract items from the receipt
  const items: ReceiptItem[] = [];
  const potentialItems = extractPotentialItems(text);
  
  for (const line of potentialItems) {
    const extractedItem = extractPriceFromLine(line);
    if (extractedItem && extractedItem.name && extractedItem.price) {
      // Make sure we don't have duplicates
      const isDuplicate = items.some(item => 
        item.name.toLowerCase() === extractedItem.name.toLowerCase() && 
        item.amount === extractedItem.price
      );
      
      if (!isDuplicate && !isNonItemText(extractedItem.name)) {
        items.push({
          name: extractedItem.name,
          amount: extractedItem.price
        });
      }
    }
  }
  
  // Extract total amount
  let total = '0.00';
  const totalRegex = /total\s*[\$]?\s*(\d+[\.,]\d{2})/i;
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].toLowerCase();
    if (line.includes('total')) {
      const match = line.match(totalRegex);
      if (match && match[1]) {
        total = match[1].replace(',', '.');
        break;
      }
    }
  }
  
  // If we couldn't find a total but have items, use the sum of items
  if (total === '0.00' && items.length > 0) {
    const sum = items.reduce((acc, item) => acc + parseFloat(item.amount), 0);
    total = sum.toFixed(2);
  }
  
  return {
    merchant,
    date,
    total,
    items
  };
}

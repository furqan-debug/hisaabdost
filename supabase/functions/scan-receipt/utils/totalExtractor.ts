
// Functions for extracting total amount from receipt text

// Extract the total amount from receipt text
export function extractTotal(
  lines: string[], 
  items: Array<{name: string; amount: string; category: string}>
): string {
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
    /total\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /amount\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i
  ];
  
  // First look at the bottom portion of the receipt where totals are typically found
  const startIndex = Math.floor(lines.length * 0.6);
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Skip lines that don't contain total-related words
    if (!line.includes("total") && 
        !line.includes("amount") && 
        !line.includes("sum") && 
        !line.includes("due") && 
        !line.includes("balance")) {
      continue;
    }
    
    for (const pattern of totalPatterns) {
      const totalMatch = lines[i].match(pattern);
      if (totalMatch) {
        console.log(`Found total: $${totalMatch[1]} using pattern: ${pattern}`);
        return totalMatch[1];
      }
    }
  }
  
  // Second pass: look for any dollar amount on a line containing 'total'
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("total") || line.includes("amount due")) {
      const amountMatch = lines[i].match(/\$?\s*(\d+\.\d{2})/);
      if (amountMatch) {
        console.log(`Found total from 'total' line: $${amountMatch[1]}`);
        return amountMatch[1];
      }
    }
  }
  
  // Third pass: look for standalone dollar amounts near the bottom
  for (let i = Math.floor(lines.length * 0.8); i < lines.length; i++) {
    const amountMatch = lines[i].match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
    if (amountMatch && parseFloat(amountMatch[1]) > 0) {
      // Check if this amount is significantly larger than any item price
      // (could indicate it's the total)
      const amount = parseFloat(amountMatch[1]);
      const maxItemPrice = Math.max(...items.map(item => parseFloat(item.amount) || 0));
      
      if (amount > maxItemPrice || amount >= sumItemPrices(items) * 0.9) {
        console.log(`Found potential total from standalone amount: $${amountMatch[1]}`);
        return amountMatch[1];
      }
    }
  }
  
  // Calculate sum of items as fallback
  const sum = sumItemPrices(items);
  if (sum > 0) {
    console.log(`Calculated total from items: $${sum.toFixed(2)}`);
    return sum.toFixed(2);
  }
  
  return "0.00";
}

// Sum the prices of all items
function sumItemPrices(items: Array<{name: string; amount: string; category: string}>): number {
  return items.reduce((total, item) => {
    const amount = parseFloat(item.amount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
}

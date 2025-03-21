
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
  
  // First try a very explicit pattern: look for lines containing only "TOTAL" and a number
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^total\s*\$?\s*\d+\.\d{2}$/i)) {
      const match = line.match(/\$?\s*(\d+\.\d{2})/i);
      if (match && match[1]) {
        console.log(`Found total with explicit pattern: $${match[1]}`);
        return match[1];
      }
    }
  }
  
  // Look at the bottom 40% of the receipt where totals are typically found
  const startIndex = Math.floor(lines.length * 0.6);
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Focus on lines that might contain total information
    if (line.includes("total") || 
        line.includes("amount") || 
        line.includes("sum") || 
        line.includes("due") || 
        line.includes("balance")) {
      
      for (const pattern of totalPatterns) {
        const totalMatch = lines[i].match(pattern);
        if (totalMatch) {
          console.log(`Found total: $${totalMatch[1]} using pattern: ${pattern}`);
          return totalMatch[1];
        }
      }
    }
  }
  
  // Second pass: Look for any line that is just a dollar amount near the bottom
  for (let i = Math.floor(lines.length * 0.7); i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^\$?\s*\d+\.\d{2}\s*$/)) {
      const amountMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (amountMatch) {
        console.log(`Found potential total from standalone amount: $${amountMatch[1]}`);
        return amountMatch[1];
      }
    }
  }
  
  // Third pass: look for any dollar amount on a line containing 'total'
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("total") || line.includes("amount due")) {
      const amountMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (amountMatch) {
        console.log(`Found total from 'total' line: $${amountMatch[1]}`);
        return amountMatch[1];
      }
    }
  }
  
  // Fourth pass: Find the largest dollar amount in the bottom quarter of the receipt
  let largestAmount = 0;
  for (let i = Math.floor(lines.length * 0.75); i < lines.length; i++) {
    const line = lines[i];
    const amountMatches = line.match(/\$?\s*(\d+\.\d{2})/g);
    if (amountMatches) {
      for (const amountMatch of amountMatches) {
        const amount = parseFloat(amountMatch.replace(/[^\d.]/g, ''));
        if (!isNaN(amount) && amount > largestAmount) {
          largestAmount = amount;
        }
      }
    }
  }
  
  if (largestAmount > 0) {
    console.log(`Found largest amount near the bottom: $${largestAmount.toFixed(2)}`);
    return largestAmount.toFixed(2);
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

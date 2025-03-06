
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

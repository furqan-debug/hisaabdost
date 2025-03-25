
/**
 * Extracts the total amount from receipt text (used as fallback)
 */
export function extractAmount(lines: string[], fullText: string): string {
  // Look for total patterns with common keywords
  const totalPatterns = [
    // US/International patterns
    /total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /total\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /amount\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /balance\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /grand\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /final\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /sum\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /total\s*amount\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /to\s*pay\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    
    // European patterns with comma as decimal separator
    /total\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,
    /total\s*due\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,
    /amount\s*due\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,
    /balance\s*due\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,
    /grand\s*total\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,
    /sum\s*total\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,
    /summe\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,  // German "Summe"
    /gesamtbetrag\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,  // German "Gesamtbetrag"
    /somme\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,  // French "Somme"
    /totale\s*[:\.\s]*\s*(\d+,\d{2})(?:\s*[€£])?/i,  // Italian "Totale"
  ];
  
  // First look at the bottom portion of the receipt where totals are typically found
  const bottomThird = Math.floor(lines.length * 0.6);
  for (let i = bottomThird; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Focus on lines containing total-related keywords
    if (line.includes("total") || line.includes("amount due") || 
        line.includes("balance") || line.includes("to pay") || 
        line.includes("sum") || line.includes("due") ||
        line.includes("summe") || line.includes("gesamtbetrag") || 
        line.includes("somme") || line.includes("totale")) {
      
      // Try all total patterns
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          // Normalize comma to period for decimal separator
          return match[1].replace(',', '.');
        }
      }
      
      // Fallback: look for any dollar/euro amount in this line
      const amountMatch = line.match(/\$?\s*(\d+\.\d{2})/) || 
                         line.match(/(\d+,\d{2})(?:\s*[€£])?/);
      if (amountMatch && amountMatch[1]) {
        return amountMatch[1].replace(',', '.');
      }
    }
  }
  
  // Second pass: look for standalone amounts near the bottom (could be totals without labels)
  for (let i = Math.floor(lines.length * 0.8); i < lines.length; i++) {
    // Try different formats
    const amountMatch = lines[i].match(/^\s*\$?\s*(\d+\.\d{2})\s*$/) || 
                        lines[i].match(/^\s*(\d+,\d{2})(?:\s*[€£])?\s*$/);
                        
    if (amountMatch && amountMatch[1]) {
      const amount = parseFloat(amountMatch[1].replace(',', '.'));
      if (amount > 0) {
        return amountMatch[1].replace(',', '.');
      }
    }
  }
  
  // Last resort: check the whole text for any pattern with "total"
  for (const pattern of totalPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      return match[1].replace(',', '.');
    }
  }
  
  // Very last resort: look for largest number in the receipt that might be a total
  let largestAmount = 0;
  const amountMatches = fullText.match(/\$?\s*\d+[\.,]\d{2}/g) || [];
  
  for (const match of amountMatches) {
    const amount = parseFloat(match.replace(/[\$€£\s]/g, '').replace(',', '.'));
    if (amount > largestAmount) {
      largestAmount = amount;
    }
  }
  
  return largestAmount > 0 ? largestAmount.toFixed(2) : "0.00";
}

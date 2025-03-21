
/**
 * Extracts the total amount from receipt text (used as fallback)
 */
export function extractAmount(lines: string[], fullText: string): string {
  // Look for total patterns with common keywords
  const totalPatterns = [
    /total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /total\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /amount\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /balance\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /grand\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /final\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /sum\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /total\s*amount\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /to\s*pay\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
  ];
  
  // First look at the bottom portion of the receipt where totals are typically found
  const bottomThird = Math.floor(lines.length * 0.6);
  for (let i = bottomThird; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Focus on lines containing total-related keywords
    if (line.includes("total") || line.includes("amount due") || 
        line.includes("balance") || line.includes("to pay") || 
        line.includes("sum") || line.includes("due")) {
      
      // Try all total patterns
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // Fallback: look for any dollar amount in this line
      const amountMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (amountMatch && amountMatch[1]) {
        return amountMatch[1];
      }
    }
  }
  
  // Second pass: look for standalone amounts near the bottom (could be totals without labels)
  for (let i = Math.floor(lines.length * 0.8); i < lines.length; i++) {
    const amountMatch = lines[i].match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
    if (amountMatch && amountMatch[1] && parseFloat(amountMatch[1]) > 0) {
      return amountMatch[1];
    }
  }
  
  // Last resort: check the whole text for any pattern with "total"
  for (const pattern of totalPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return "0.00";
}

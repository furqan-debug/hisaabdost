
/**
 * Extracts the merchant/store name from receipt text
 * @param lines Array of text lines from the receipt
 * @returns The extracted merchant name or "Unknown Merchant"
 */
export function extractMerchant(lines: string[]): string {
  // Early exit for empty input
  if (!lines || lines.length === 0) {
    return "Unknown Merchant";
  }

  // Usually the first few lines of a receipt contain the store name
  // Try various strategies to find the most likely store name
  
  // Strategy 1: Look for ALL CAPS names in the first few lines
  // Store names are often in ALL CAPS at the top of receipts
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip very short lines or lines with common non-store patterns
    if (line.length < 3 || 
        line.match(/receipt|invoice|tel:|www\.|http|thank|order|date|time|\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}|\d+\.\d{2}|\$\d+\.\d{2}/i)) {
      continue;
    }
    
    // If the line is ALL CAPS and not too long, it's likely the store name
    if (line === line.toUpperCase() && line.length > 3 && line.length < 50) {
      return line;
    }
  }
  
  // Strategy 2: Take the first non-empty, non-date, non-numeric line
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip lines that are likely not store names
    if (line.length < 3 || 
        line.match(/receipt|invoice|tel:|www\.|http|thank|order|date|time|\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}/i)) {
      continue;
    }
    
    // Take the first line that looks like a name (not too short, not too long)
    if (line.length > 2 && line.length < 40 && !line.match(/^\d+(\.\d+)?$/)) {
      return line;
    }
  }
  
  // Strategy 3: Look for lines containing "store", "restaurant", "market", etc.
  const storeKeywords = ["store", "restaurant", "market", "cafe", "shop", "mart", "deli", "bakery", "grocer"];
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (storeKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      return lines[i].trim();
    }
  }
  
  // Final fallback: just use the first line
  if (lines[0] && lines[0].trim().length > 0) {
    return lines[0].trim();
  }
  
  return "Unknown Merchant";
}


/**
 * Extracts the merchant/store name from receipt text
 */
export function extractMerchant(lines: string[]): string {
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
    // If no better match, default to first line
    return lines[0];
  }
  return "Unknown Merchant";
}


// Common patterns for finding the items section in a receipt
export function findItemsSectionStart(lines: string[]): number {
  // Usually items start after headers, store info, etc.
  // Look for common section indicators or just return a reasonable default
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("item") || 
        line.includes("description") || 
        line.includes("qty") || 
        line.includes("price") ||
        line.includes("amount")) {
      return i + 1; // Start after this header line
    }
  }
  
  // Default: skip the first few lines (likely header/store info)
  return Math.min(5, Math.floor(lines.length * 0.1));
}

export function findItemsSectionEnd(lines: string[]): number {
  // Items usually end before footer elements like totals
  for (let i = Math.floor(lines.length * 0.6); i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("subtotal") || 
        line.includes("total") || 
        line.includes("tax") ||
        line.includes("balance")) {
      return i - 1; // End before this footer line
    }
  }
  
  // Default: exclude the last few lines (likely footer/totals)
  return Math.max(lines.length - 5, Math.ceil(lines.length * 0.8));
}

// Common patterns to extract items with prices
export const itemExtractionPatterns = [
  // Standard item with price at end
  /^(.+?)\s+\$?(\d+\.\d{2})$/,
  
  // Item with quantity x price
  /(\d+)\s*[xX]\s*(.+?)\s*@\s*\$?(\d+\.\d{2})/,
  
  // Item with price anywhere
  /^(.+?)\s+\$?(\d+\.\d{2})/,
  
  // More flexible pattern for various formats
  /(.+?)(?:\s|:)+\$?(\d+\.\d{2})(?:\s|$)/
];


// Common patterns for finding the items section in a receipt
export function findItemsSectionStart(lines: string[]): number {
  // Usually items start after headers, store info, etc.
  // Look for common section indicators or just return a reasonable default
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("item") || 
        line.includes("description") || 
        line.includes("qty") || 
        line.includes("price") ||
        line.includes("amount") ||
        line.includes("product") ||
        line.match(/^-{5,}$/) || // Dashed line separator
        line.match(/^\*{5,}$/)) { // Star line separator
      return i + 1; // Start after this header line
    }
  }
  
  // Default: skip the first few lines (likely header/store info)
  return Math.min(5, Math.floor(lines.length * 0.1));
}

export function findItemsSectionEnd(lines: string[]): number {
  // Items usually end before footer elements like totals
  for (let i = Math.floor(lines.length * 0.5); i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("subtotal") || 
        line.includes("total") || 
        line.includes("tax") ||
        line.includes("balance") ||
        line.includes("change") ||
        line.includes("cash") ||
        line.includes("card") ||
        line.includes("payment") ||
        line.includes("thank you")) {
      return i - 1; // End before this footer line
    }
  }
  
  // Default: exclude the last few lines (likely footer/totals)
  return Math.max(lines.length - 8, Math.ceil(lines.length * 0.8));
}

// Common patterns to extract items with prices
export const itemExtractionPatterns = [
  // Standard item with price at end
  /^(.+?)\s+\$?(\d+\.\d{2})$/,
  
  // Item with quantity x price
  /(\d+)\s*[xX]\s*(.+?)\s*@?\s*\$?(\d+\.\d{2})/,
  
  // Item with price anywhere
  /^(.+?)\s+\$?(\d+\.\d{2})/,
  
  // More flexible pattern for various formats
  /(.+?)(?:\s|:)+\$?(\d+\.\d{2})(?:\s|$)/,
  
  // Number + item name + price (common in grocery receipts)
  /^\d+\s+(.+?)\s+\$?(\d+\.\d{2})$/,
  
  // Item with price with potential multiple spaces or tabs
  /(.+?)\s{2,}(\d+\.\d{2})$/,
  
  // Item code + description + price
  /\d{3,}[-\s]+(.+?)\s+\$?(\d+\.\d{2})$/,
  
  // Indian/European currency format with ₹/€ symbol and comma for decimal
  /(.+?)\s+[₹€]\s*(\d+[,\.]\d{2})$/,
  
  // Indian format with ₹ symbol at beginning
  /(.+?)\s+₹\s*(\d+[,\.]\d{2})$/,
  
  // Format for receipt in the image: quantity | item | price
  /^(\d+)\s+(.+?)\s+[₹€$]\s*(\d+[,\.]\d{2})$/
];

// Improved helper functions for item extraction
export function isLikelyItemLine(line: string): boolean {
  // Check if the line contains a price pattern with any common currency symbol
  if (line.match(/[\$₹€]?\d+[,\.]\d{2}/) || line.match(/\d+\s*@\s*[\$₹€]?\d+[,\.]\d{2}/)) {
    // Exclude lines that are likely non-item lines
    const nonItemPatterns = [
      /subtotal/i, /tax/i, /total/i, /balance/i, /change/i, 
      /card/i, /cash/i, /payment/i, /discount/i, /thank you/i,
      /receipt/i, /date/i, /time/i, /store/i, /address/i, /tel/i,
      /sale/i, /visa/i, /mastercard/i, /credit/i, /debit/i
    ];
    
    // Check if the line matches any non-item pattern
    for (const pattern of nonItemPatterns) {
      if (line.match(pattern)) {
        return false;
      }
    }
    
    return true;
  }
  
  return false;
}

export function cleanItemText(text: string): string {
  if (!text) return '';
  
  // Remove common prefixes
  text = text
    .replace(/^item[:\s]+/i, '')
    .replace(/^product[:\s]+/i, '')
    .replace(/^[\d]+[\s-]+/, '') // Item numbers/codes
    .replace(/^\*+\s*/, '') // Asterisks
    .replace(/^-+\s*/, ''); // Dashes
  
  // Remove non-descriptive elements
  text = text
    .replace(/SKU\s*\d+/i, '')
    .replace(/UPC\s*\d+/i, '')
    .replace(/PLU\s*\d+/i, '')
    .replace(/\(\d+\s*for\s*\$?[\d\.]+\)/i, '') // Multi-buy offers
    .replace(/\d+\s*\@\s*\$?[\d\.]+/i, ''); // Price per unit
  
  // Remove trailing price-related text
  text = text
    .replace(/\s+[\$₹€]\s*\d+[,\.]\d{2}$/, '')
    .replace(/\s+\d+[,\.]\d{2}$/, '');
  
  // Remove item quantities from the start (like "2 x")
  text = text
    .replace(/^\d+\s*[xX]\s*/, '')
    .replace(/^\s*[xX]\s*\d+\s*/, '');
    
  // Handle fish burger case like in the image
  if (text.toLowerCase().includes('fish') || text.toLowerCase().includes('burger')) {
    text = text.replace(/\s+$/, '');
  }
  
  // Trim whitespace and capitalize first letter
  text = text.trim();
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  
  return text;
}

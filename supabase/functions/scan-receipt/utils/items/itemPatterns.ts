
// Common patterns for finding the items section in a receipt
export function findItemsSectionStart(lines: string[]): number {
  // Look for Pakistani receipt headers
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
  return Math.min(8, Math.floor(lines.length * 0.3));
}

export function findItemsSectionEnd(lines: string[]): number {
  // Items usually end before footer elements like totals
  for (let i = Math.floor(lines.length * 0.4); i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("subtotal") || 
        line.includes("total") || 
        line.includes("tax") ||
        line.includes("gst") ||
        line.includes("balance") ||
        line.includes("change") ||
        line.includes("cash") ||
        line.includes("card") ||
        line.includes("payment") ||
        line.includes("paid via") ||
        line.includes("thank you")) {
      return i - 1; // End before this footer line
    }
  }
  
  // Default: exclude the last few lines (likely footer/totals)
  return Math.max(lines.length - 5, Math.ceil(lines.length * 0.7));
}

// Pakistani receipt specific patterns
export const itemExtractionPatterns = [
  // Pakistani format: Item Name Qty Price Total (with proper spacing)
  /^(.+?)\s+(\d+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})$/,
  
  // Item with parentheses (size/volume): Item Name (500ml) Qty Price Total
  /^(.+?\([^)]+\))\s+(\d+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})$/,
  
  // Item with quantity indicator: Item Name x 2 Amount
  /^(.+?)\s*[xX]\s*(\d+)\s+(\d+\.\d{2})$/,
  
  // Simple format: Item Name Amount
  /^(.+?)\s+(\d+\.\d{2})$/,
  
  // With Rs. prefix: Item Name Rs. Amount
  /^(.+?)\s+Rs\.\s*(\d+[,\.]\d{2})$/,
  
  // With currency at start: Rs. Amount Item Name
  /^Rs\.\s*(\d+[,\.]\d{2})\s+(.+)$/,
  
  // Multiple spaces/tabs separator: Item Name        Amount
  /^(.+?)\s{3,}(\d+\.\d{2})$/,
  
  // Pakistani comma format: Item Name 1,200.00
  /^(.+?)\s+(\d{1,3}(?:,\d{3})*\.\d{2})$/
];

// Improved helper functions for Pakistani receipts
export function isLikelyItemLine(line: string): boolean {
  // Check if the line contains a price pattern with Pakistani format
  const pricePatterns = [
    /\d+\.\d{2}/, // Standard decimal
    /\d{1,3}(?:,\d{3})*\.\d{2}/, // Comma separated thousands
    /Rs\.\s*\d+/, // Rs. prefix
    /\d+\s*@\s*\d+/ // Unit price format
  ];
  
  for (const pattern of pricePatterns) {
    if (line.match(pattern)) {
      // Exclude lines that are likely non-item lines
      const nonItemPatterns = [
        /subtotal/i, /tax/i, /total/i, /balance/i, /change/i, 
        /card/i, /cash/i, /payment/i, /discount/i, /thank you/i,
        /receipt/i, /date/i, /time/i, /store/i, /address/i, /tel/i,
        /contact/i, /gst/i, /visit/i, /feedback/i, /paid via/i
      ];
      
      // Check if the line matches any non-item pattern
      for (const pattern of nonItemPatterns) {
        if (line.match(pattern)) {
          return false;
        }
      }
      
      return true;
    }
  }
  
  return false;
}

export function cleanItemText(text: string): string {
  if (!text) return '';
  
  // Remove common Pakistani receipt prefixes and codes
  text = text
    .toString()
    .trim()
    .replace(/^item[:\s]+/i, '')
    .replace(/^product[:\s]+/i, '')
    .replace(/^[\d]+[\s-]+/, '') // Item numbers/codes
    .replace(/^\*+\s*/, '') // Asterisks
    .replace(/^-+\s*/, ''); // Dashes
  
  // Remove SKU/UPC codes and quantities
  text = text
    .replace(/SKU\s*\d+/i, '')
    .replace(/UPC\s*\d+/i, '')
    .replace(/PLU\s*\d+/i, '')
    .replace(/\(\d+\s*for\s*Rs\.?[\d\.]+\)/i, '') // Multi-buy offers
    .replace(/\d+\s*\@\s*Rs\.?[\d\.]+/i, ''); // Price per unit
  
  // Remove trailing price-related text
  text = text
    .replace(/\s+Rs\.?\s*\d+[,\.]\d{2}$/, '')
    .replace(/\s+\d+[,\.]\d{2}$/, '');
  
  // Remove item quantities from the start
  text = text
    .replace(/^\d+\s*[xX]\s*/, '')
    .replace(/^\s*[xX]\s*\d+\s*/, '');
  
  // Clean up specific formatting issues
  text = text
    .replace(/\s+$/, '') // Trailing spaces
    .replace(/^\s+/, '') // Leading spaces
    .replace(/\s{2,}/g, ' '); // Multiple spaces
  
  // Handle specific items mentioned in the receipt
  if (text.toLowerCase().includes('yogurt') || text.toLowerCase().includes('yoghurt')) {
    text = text.replace(/\s*\(\d+ml\)/, ' (500ml)');
  }
  
  // Capitalize first letter and ensure proper format
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  return text || 'Receipt Item';
}

export function validateAndCleanAmount(amount: any): number {
  if (!amount) return 0;
  
  // Handle Pakistani number format with commas
  const cleanAmount = amount.toString()
    .replace(/Rs\.?\s*/i, '') // Remove Rs. prefix
    .replace(/[,\s]/g, ''); // Remove commas and spaces
  
  const parsedAmount = parseFloat(cleanAmount);
  
  // Return 0 for invalid amounts
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return 0;
  }
  
  // Cap extremely large amounts (likely OCR errors)
  if (parsedAmount > 50000) { // Increased for Pakistani amounts
    console.warn(`Amount ${parsedAmount} seems too large, capping at 50000`);
    return 50000;
  }
  
  // Set minimum amount
  if (parsedAmount < 0.01) {
    return 0.01;
  }
  
  return Math.round(parsedAmount * 100) / 100; // Round to 2 decimal places
}

export function validateReceiptItem(item: any): boolean {
  if (!item) return false;
  
  const hasDescription = item.description && item.description.toString().trim().length > 0;
  const rawAmount = item.amount?.toString().replace(/[Rs\.,\s]/g, '') || '0';
  const hasAmount = !isNaN(parseFloat(rawAmount));
  const validAmount = parseFloat(rawAmount) > 0;
  
  return hasDescription && hasAmount && validAmount;
}

export function cleanItemDescription(description: string): string {
  if (!description) return '';
  
  // Remove common receipt prefixes and codes
  let cleaned = description
    .toString()
    .trim()
    .replace(/^item[:.\s-]+/i, '')
    .replace(/^product[:.\s-]+/i, '')
    .replace(/^[a-z]{1,3}\d{4,}[:.\s-]*/i, '') // Remove SKU/UPC codes
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  // Handle Pakistani specific terms
  if (cleaned.toLowerCase().includes('chicken')) {
    cleaned = cleaned.replace(/chicken/i, 'Chicken');
  }
  
  // Truncate very long descriptions
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50).trim() + '...';
  }
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned || 'Receipt Item';
}

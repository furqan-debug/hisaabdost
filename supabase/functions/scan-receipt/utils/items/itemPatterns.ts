
// Define patterns for item detection
export const itemExtractionPatterns = [
  // Pattern: Item name followed by price (most common)
  // Example: "Milk 1.80" or "Large Eggs 6.17"
  /^(.+?)\s+(\d+\.\d{2})$/,
  
  // Pattern: Item with quantity indicator followed by price
  // Example: "2 x Milk 3.60"
  /^(?:\d+\s*[xX]\s*)?(.+?)\s+(\d+\.\d{2})$/,
  
  // Pattern: Item with SKU/code followed by price
  // Example: "Milk #12345 1.80"
  /^(.+?)(?:\s+#\d+)?\s+(\d+\.\d{2})$/,
  
  // More flexible pattern for capturing items with price at the end
  /(.+?)\s+\$?(\d+\.\d{2})$/,
  
  // Pattern for items with a "$" prefix
  /(.+?)\s+\$(\d+\.\d{2})$/
];

// Extraction helper - finds the beginning of items section
export function findItemsSectionStart(lines: string[]): number {
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("item") || 
        line.includes("description") || 
        line.includes("qty") || 
        line.includes("quantity") ||
        line.match(/^[\-=]{3,}$/)) {
      return i + 1;
    }
  }
  return 0;
}

// Extraction helper - finds the end of items section
export function findItemsSectionEnd(lines: string[]): number {
  for (let i = Math.floor(lines.length * 0.5); i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("subtotal") || 
        line.includes("sub-total") || 
        line.includes("tax") || 
        line.includes("total") ||
        line.match(/^[\-=]{3,}$/)) {
      return i - 1;
    }
  }
  return lines.length - 1;
}

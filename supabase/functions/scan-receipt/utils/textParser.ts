
import { formatPrice, capitalizeFirstLetter, guessCategory } from "./formatting.ts";
import { extractDate } from "./dateExtractor.ts";

// Parse receipt text into a structured format
export function parseReceiptText(text: string) {
  console.log("Starting receipt text parsing")
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  console.log(`Parsing ${lines.length} lines of text`)
  
  const result = []
  
  // Extract date from receipt
  const date = extractDate(text) || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  console.log("Extracted date:", date)
  
  // Try to extract store name
  const storeName = extractStoreName(lines)
  
  // Look for item patterns in each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip lines that are likely to be headers, footers, or totals
    if (shouldSkipLine(line)) {
      continue
    }
    
    // Try to identify item-price pattern
    const itemMatch = extractItemAndPrice(line)
    
    if (itemMatch) {
      const { name, price } = itemMatch
      
      if (name.length >= 2 && price > 0) {
        result.push({
          date: date,
          name: capitalizeFirstLetter(name),
          amount: formatPrice(price),
          category: guessCategory(name),
          store: storeName
        })
      }
    }
  }
  
  // If we didn't find any items using standard patterns, try more aggressive pattern matching
  if (result.length === 0) {
    console.log("No items found with standard patterns, trying aggressive matching")
    return aggressiveItemExtraction(lines, date, storeName)
  }
  
  return result
}

// Try to extract store name from the receipt
function extractStoreName(lines: string[]) {
  // Look at the first few lines for store name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim()
    
    // Skip very short lines
    if (line.length < 3) continue
    
    // Skip lines with common non-store patterns
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|\d{2}\/\d{2}\/\d{4}|thank|you/i)) continue
    
    // Potential store name - uppercase words are often store names at the top
    if (line.toUpperCase() === line && line.length > 3) {
      return capitalizeFirstLetter(line.toLowerCase())
    }
    
    // Another pattern - first line that's not a date, number, etc.
    if (!line.match(/^\d/) && !line.match(/^[A-Z]{1,3}$/) && line.length > 3) {
      return capitalizeFirstLetter(line)
    }
  }
  
  return "Store"  // Default if no store name found
}

// More aggressive item extraction for difficult receipts
function aggressiveItemExtraction(lines: string[], date: string, storeName: string) {
  const items = []
  
  // Consider only the middle portion of the receipt
  const startIdx = Math.floor(lines.length * 0.2)
  const endIdx = Math.floor(lines.length * 0.8)
  
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i].trim()
    
    // Skip very short lines
    if (line.length < 3) continue
    
    // Look for price patterns anywhere
    const priceMatch = line.match(/(\d+\.\d{2})/)
    if (priceMatch) {
      const price = parseFloat(priceMatch[1])
      
      // Get potential item name by removing the price
      let name = line.replace(priceMatch[0], '').trim()
      
      // Clean up the name
      name = name.replace(/^\d+\s*x\s*/, '')  // Remove "2 x " prefix
            .replace(/^\d+\s+/, '')           // Remove "2 " prefix
            .replace(/^[#*]+\s*/, '')         // Remove "### " prefix
            .replace(/\s{2,}/g, ' ')          // Remove multiple spaces
      
      if (name.length >= 2 && price > 0 && !shouldSkipLine(name)) {
        items.push({
          date: date,
          name: capitalizeFirstLetter(name),
          amount: formatPrice(price),
          category: guessCategory(name),
          store: storeName
        })
      }
    }
  }
  
  // If still no items found, create at least one generic item
  if (items.length === 0) {
    console.log("No items found with aggressive matching, using fallback item")
    items.push({
      date: date,
      name: "Store Purchase",
      amount: "10.00",
      category: "Shopping",
      store: storeName
    })
  }
  
  return items
}

// Extract item name and price from a line
function extractItemAndPrice(line: string) {
  // Pattern: item followed by price at the end of line
  const priceAtEndMatch = line.match(/(.+?)\s+\$?(\d+\.\d{2})(?:\s|$)/)
  if (priceAtEndMatch) {
    const name = cleanItemName(priceAtEndMatch[1])
    const price = parseFloat(priceAtEndMatch[2])
    return { name, price }
  }
  
  // Pattern: item with price anywhere in the line
  const priceAnywhereMatch = line.match(/(.+?)\s+\$?(\d+\.\d{2})/)
  if (priceAnywhereMatch) {
    const name = cleanItemName(priceAnywhereMatch[1])
    const price = parseFloat(priceAnywhereMatch[2])
    return { name, price }
  }
  
  // Try to find any price pattern
  const anyPriceMatch = line.match(/\$?(\d+\.\d{2})/)
  if (anyPriceMatch) {
    // Get the parts of the line before and after the price
    const parts = line.split(anyPriceMatch[0])
    if (parts.length >= 1) {
      // Use the longer part as the name
      const name = parts.reduce((longest, current) => 
        current.trim().length > longest.length ? current.trim() : longest, "")
      
      if (name.length >= 2) {
        return { name: cleanItemName(name), price: parseFloat(anyPriceMatch[1]) }
      }
    }
  }
  
  return null
}

// Clean up item name
function cleanItemName(name: string) {
  return name
    .replace(/^\d+\s*[xX]\s*/, '') // Remove quantity indicators like "2 x"
    .replace(/^\d+\s+/, '')         // Remove quantity numbers like "2 "
    .replace(/^#\d+\s*/, '')        // Remove item numbers like "#123"
    .replace(/\s{2,}/g, ' ')        // Remove multiple spaces
    .trim()
}

// Check if a line should be skipped (not an item)
function shouldSkipLine(line: string) {
  const lowerLine = line.toLowerCase()
  
  // Skip common non-item lines
  return lowerLine.includes('total') ||
         lowerLine.includes('subtotal') ||
         lowerLine.includes('tax') ||
         lowerLine.includes('change') ||
         lowerLine.includes('cash') ||
         lowerLine.includes('card') ||
         lowerLine.includes('credit') ||
         lowerLine.includes('debit') ||
         lowerLine.includes('balance') ||
         lowerLine.includes('due') ||
         lowerLine.includes('payment') ||
         lowerLine.includes('receipt') ||
         lowerLine.includes('order') ||
         lowerLine.includes('transaction') ||
         lowerLine.includes('thank you') ||
         lowerLine.includes('welcome') ||
         lowerLine.match(/^\d+$/) !== null // Just numbers
}


import { itemExtractionPatterns, findItemsSectionStart, findItemsSectionEnd } from "./items/itemPatterns";
import { cleanupItemName } from "./items/itemCleanup";
import { shouldSkipLine, isNonItemText, deduplicateItems } from "./items/itemHelpers";
import { guessCategoryFromItemName } from "./items/itemCategories";
import { fallbackItemExtraction } from "./items/fallbackExtractor";

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Filter out receipt header and footer sections
  let startLineIndex = findItemsSectionStart(lines);
  let endLineIndex = findItemsSectionEnd(lines);
  
  // Process the section containing item lines
  for (let i = startLineIndex; i <= endLineIndex; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines or known non-item text
    if (line.length < 3 || shouldSkipLine(line)) {
      continue;
    }
    
    // Try each pattern to extract items
    let itemFound = false;
    for (const pattern of itemExtractionPatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = cleanupItemName(match[1]);
        const price = match[2];
        
        // Validation: check name is meaningful and price is valid
        if (name.length >= 2 && !isNonItemText(name) && parseFloat(price) > 0) {
          items.push({
            name: name,
            amount: price,
            category: guessCategoryFromItemName(name)
          });
          itemFound = true;
          break;
        }
      }
    }
    
    // If we couldn't match with standard patterns, try more aggressive patterns
    if (!itemFound) {
      // Look for any price pattern in the line
      const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (priceMatch) {
        // Extract the price
        const price = priceMatch[1];
        // Extract the item name by removing the price part
        let nameText = line.replace(priceMatch[0], '').trim();
        nameText = cleanupItemName(nameText);
        
        // Only add if we have a reasonable name and price
        if (nameText.length >= 2 && !isNonItemText(nameText) && parseFloat(price) > 0) {
          items.push({
            name: nameText,
            amount: price,
            category: guessCategoryFromItemName(nameText)
          });
        }
      }
    }
  }
  
  // If we didn't find any items with direct matching, try the fallback method
  if (items.length === 0) {
    console.log("No items found with direct matching, trying fallback method");
    return fallbackItemExtraction(lines);
  }
  
  console.log(`Extracted ${items.length} items from receipt`);
  
  // Return deduped items sorted by price
  return deduplicateItems(items);
}

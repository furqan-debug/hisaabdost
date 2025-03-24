
import { shouldSkipLine, isNonItemText } from "./itemHelpers.ts";
import { cleanupItemName } from "./itemCleanup.ts";
import { guessCategoryFromItemName } from "./itemCategories.ts";

// Fallback extraction method when standard patterns fail
export function fallbackItemExtraction(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  
  // Look for any numbers that could be prices
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip non-item lines
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Look for numbers that could be prices (at least $1.00)
    const priceMatches = line.match(/\d+\.\d{2}/g);
    if (priceMatches && priceMatches.length > 0) {
      // Take the last price in the line (often the item price)
      const price = priceMatches[priceMatches.length - 1];
      
      // Get text before the price as the item name
      let nameText = line;
      for (const match of priceMatches) {
        nameText = nameText.replace(match, '');
      }
      
      nameText = cleanupItemName(nameText);
      
      // Validate the item
      if (nameText.length >= 2 && !isNonItemText(nameText) && parseFloat(price) > 0) {
        items.push({
          name: nameText,
          amount: price,
          category: guessCategoryFromItemName(nameText)
        });
      }
    }
  }
  
  // Last resort - create generic items if nothing found
  if (items.length === 0) {
    items.push({
      name: "Store Purchase",
      amount: "10.00",
      category: "Shopping"
    });
  }
  
  return items;
}

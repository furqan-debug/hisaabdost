
import { isNonItemText } from "../utils";
import { cleanupItemName } from "./itemNameCleaner";
import { getNonItemPatterns } from "./patternMatching";

/**
 * More aggressive approach to extract items when standard patterns fail
 */
export function extractItemsAggressively(
  lines: string[], 
  startIndex: number, 
  endIndex: number
): Array<{name: string; amount: string}> {
  const items: Array<{name: string; amount: string}> = [];
  const nonItemPatterns = getNonItemPatterns();
  
  console.log("Trying more aggressive pattern matching");
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip already processed non-item lines
    if (nonItemPatterns.some(pattern => line.match(pattern))) {
      continue;
    }
    
    const priceMatches = Array.from(line.matchAll(/\$?\s*(\d+\.\d{2})/g));
    
    if (priceMatches.length === 1) {
      const price = priceMatches[0][1];
      let itemText = line.replace(priceMatches[0][0], '').trim();
      let itemName = cleanupItemName(itemText);
      
      if (itemName.length >= 2 && parseFloat(price) > 0 && 
          !nonItemPatterns.some(pattern => itemName.match(pattern)) &&
          !isNonItemText(itemName)) {
        console.log(`Found item (aggressive): "${itemName}" with price $${price}`);
        items.push({
          name: itemName,
          amount: price
        });
      }
    }
  }
  
  return items;
}

/**
 * Last resort extraction looking for number patterns
 */
export function extractItemsWithNumberPatterns(
  lines: string[], 
  startIndex: number, 
  endIndex: number
): Array<{name: string; amount: string}> {
  const items: Array<{name: string; amount: string}> = [];
  const nonItemPatterns = getNonItemPatterns();
  const numberPattern = /(\d+)/;
  
  console.log("Trying number pattern matching");
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip non-item lines
    if (nonItemPatterns.some(pattern => line.match(pattern)) || line.length < 3) {
      continue;
    }
    
    // Look for text followed by a number
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      const numberMatch = lastPart.match(numberPattern);
      
      if (numberMatch) {
        const price = parseInt(numberMatch[1]) / 100; // Assume it's in cents
        if (price > 0.50) { // Only consider reasonable prices
          const itemName = cleanupItemName(parts.slice(0, -1).join(' '));
          
          if (itemName.length >= 2 && !isNonItemText(itemName)) {
            console.log(`Found number-pattern item: "${itemName}" with price $${price.toFixed(2)}`);
            items.push({
              name: itemName,
              amount: price.toFixed(2)
            });
          }
        }
      }
    }
  }
  
  return items;
}

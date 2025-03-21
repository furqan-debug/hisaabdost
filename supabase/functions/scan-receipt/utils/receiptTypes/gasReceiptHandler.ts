
import { cleanupItemName } from "../items/itemCleanup.ts";
import { shouldSkipLine } from "../items/itemHelpers.ts";
import { guessCategoryFromItemName } from "../items/itemCategories.ts";

// Extract items from a gas receipt
export function extractGasReceiptItems(
  lines: string[], 
  storeName: string
): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  
  // Look for common gas related terms
  const gasTerms = [
    'regular', 'unleaded', 'premium', 'diesel', 'super', 'midgrade', 
    'gallons', 'liters', 'gas', 'fuel', 'petrol'
  ];
  
  // Flag to track if we found fuel info
  let foundFuelItem = false;
  
  // First pass - look for the primary fuel purchase
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Skip short or invalid lines
    if (line.length < 5 || shouldSkipLine(line)) continue;
    
    // Check if this line mentions gas/fuel
    const hasFuelTerm = gasTerms.some(term => line.includes(term));
    
    if (hasFuelTerm) {
      // Look for price in current or next line
      const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      
      if (priceMatch) {
        // Extract the price and create a fuel item
        const price = priceMatch[1];
        
        // If price is reasonable for gas (not too small)
        if (parseFloat(price) > 5.0) {
          items.push({
            name: `Fuel ${storeName ? `(${storeName})` : ''}`,
            amount: price,
            category: "Transportation"
          });
          
          foundFuelItem = true;
          break;
        }
      } else if (i + 1 < lines.length) {
        // Check next line for price
        const nextLine = lines[i + 1].toLowerCase();
        const nextPriceMatch = nextLine.match(/\$?\s*(\d+\.\d{2})/);
        
        if (nextPriceMatch) {
          const price = nextPriceMatch[1];
          
          // If price is reasonable for gas (not too small)
          if (parseFloat(price) > 5.0) {
            items.push({
              name: `Fuel ${storeName ? `(${storeName})` : ''}`,
              amount: price,
              category: "Transportation"
            });
            
            foundFuelItem = true;
            break;
          }
        }
      }
    }
  }
  
  // If we couldn't find a specific fuel item, look for the largest amount
  if (!foundFuelItem) {
    let largestAmount = 0;
    let largestPrice = "";
    
    for (const line of lines) {
      const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (priceMatch) {
        const price = priceMatch[1];
        const amount = parseFloat(price);
        
        if (amount > largestAmount) {
          largestAmount = amount;
          largestPrice = price;
        }
      }
    }
    
    if (largestAmount > 0) {
      items.push({
        name: `Gas purchase ${storeName ? `from ${storeName}` : ''}`,
        amount: largestPrice,
        category: "Transportation"
      });
    }
  }
  
  // Add any additional in-store purchases if found
  let foundStoreItems = false;
  
  for (const line of lines) {
    // Skip lines that likely contain the main fuel purchase
    if (gasTerms.some(term => line.toLowerCase().includes(term))) continue;
    
    // Check for store item pattern (name + price)
    const itemMatch = line.match(/(.+?)\s+\$?(\d+\.\d{2})$/);
    if (itemMatch) {
      const name = cleanupItemName(itemMatch[1]);
      const price = itemMatch[2];
      
      // Only add if the price is reasonable for a store item and isn't the main fuel purchase
      const priceValue = parseFloat(price);
      if (name.length > 2 && priceValue > 0 && priceValue < 30) {
        items.push({
          name: name,
          amount: price,
          category: guessCategoryFromItemName(name)
        });
        foundStoreItems = true;
      }
    }
  }
  
  // If we have no items at all, create a generic one
  if (items.length === 0) {
    items.push({
      name: `Gas purchase ${storeName ? `from ${storeName}` : ''}`,
      amount: "0.00",
      category: "Transportation"
    });
  }
  
  return items;
}

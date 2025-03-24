
import { itemExtractionPatterns, findItemsSectionStart, findItemsSectionEnd, isLikelyItemLine, cleanItemText } from "./items/itemPatterns.ts";
import { guessCategoryFromItemName } from "./items/itemCategories.ts";
import { shouldSkipLine, deduplicateItems } from "./items/itemHelpers.ts";
import { extractDate } from "./dateExtractor.ts";

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string; date?: string}> {
  const items: Array<{name: string; amount: string; category: string; date?: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Get receipt date
  const receiptDate = extractDate(lines.join("\n"));
  
  // Filter out receipt header and footer sections
  let startLineIndex = findItemsSectionStart(lines);
  let endLineIndex = findItemsSectionEnd(lines);
  
  console.log(`Processing item section from line ${startLineIndex} to ${endLineIndex}`);
  
  // First pass: Extract items based on recognizable patterns
  for (let i = startLineIndex; i <= endLineIndex; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines or known non-item text
    if (line.length < 3 || shouldSkipLine(line)) {
      continue;
    }
    
    // Check if the line likely contains an item
    if (isLikelyItemLine(line)) {
      // Try each pattern to extract items
      let itemFound = false;
      for (const pattern of itemExtractionPatterns) {
        const match = line.match(pattern);
        if (match) {
          // Handle patterns with quantity indicators
          if (pattern.toString().includes('[xX]')) {
            const qty = parseInt(match[1]);
            const name = cleanItemText(match[2]);
            const price = parseFloat(match[3]);
            
            if (name.length >= 2 && price > 0) {
              items.push({
                name: `${name} (${qty}x)`,
                amount: (price * qty).toFixed(2),
                category: guessCategoryFromItemName(name),
                date: receiptDate
              });
              itemFound = true;
            }
          } else {
            // Standard item-price patterns
            const name = cleanItemText(match[1]);
            const price = match[2];
            
            if (name.length >= 2 && parseFloat(price) > 0) {
              items.push({
                name: name,
                amount: price,
                category: guessCategoryFromItemName(name),
                date: receiptDate
              });
              itemFound = true;
            }
          }
          
          if (itemFound) break;
        }
      }
      
      // Second pass for this line: Use more aggressive extraction if no match found
      if (!itemFound) {
        // Look for any price pattern in the line
        const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
        if (priceMatch) {
          // Extract the price
          const price = priceMatch[1];
          // Extract the item name by removing the price part
          let nameText = line.replace(priceMatch[0], '').trim();
          nameText = cleanItemText(nameText);
          
          // Only add if we have a reasonable name and price
          if (nameText.length >= 2 && parseFloat(price) > 0) {
            items.push({
              name: nameText,
              amount: price,
              category: guessCategoryFromItemName(nameText),
              date: receiptDate
            });
          }
        }
      }
    }
  }
  
  console.log(`Found ${items.length} items from pattern matching`);
  
  // Third pass: Line by line aggressive extraction for stores with unusual receipt formats
  if (items.length <= 1) {
    console.log("Few items found, trying aggressive extraction");
    
    // Reset to use more of the receipt
    startLineIndex = Math.max(3, startLineIndex - 3);
    endLineIndex = Math.min(lines.length - 3, endLineIndex + 3);
    
    for (let i = startLineIndex; i <= endLineIndex; i++) {
      const line = lines[i].trim();
      if (line.length < 3) continue;
      
      // Look for any number that could be a price
      const priceMatches = Array.from(line.matchAll(/\$?\s*(\d+\.\d{2})/g));
      
      if (priceMatches.length === 1) {
        // Single price found - likely an item
        const price = priceMatches[0][1];
        // Get everything before the price as the name
        const nameStart = line.indexOf(priceMatches[0][0]);
        let name = nameStart > 0 ? line.substring(0, nameStart).trim() : line;
        
        // Clean and check the name
        name = cleanItemText(name);
        if (name.length >= 2 && parseFloat(price) > 0 && !shouldSkipLine(name.toLowerCase())) {
          items.push({
            name: name,
            amount: price,
            category: guessCategoryFromItemName(name),
            date: receiptDate
          });
        }
      }
    }
    
    console.log(`After aggressive extraction, found ${items.length} items`);
  }
  
  // If we didn't find any items with direct matching, create at least one item
  if (items.length === 0) {
    console.log("No items found, creating fallback item");
    
    // Look for a total amount in the receipt
    let totalAmount = "0.00";
    for (const line of lines) {
      const totalMatch = line.match(/total\s*:?\s*\$?\s*(\d+\.\d{2})/i);
      if (totalMatch) {
        totalAmount = totalMatch[1];
        break;
      }
    }
    
    // Create a generic "Store Purchase" item
    items.push({
      name: "Store Purchase",
      amount: totalAmount,
      category: "Shopping",
      date: receiptDate
    });
  }
  
  console.log(`Extracted ${items.length} total items from receipt`);
  
  // Return deduped items sorted by price (highest first)
  return deduplicateItems(items);
}

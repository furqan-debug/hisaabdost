
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
  
  // Pakistani receipt specific patterns
  const pakistaniPatterns = [
    // Standard format: Item Name Qty Price Total
    /^(.+?)\s+(\d+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})$/,
    // Format with parentheses: Item Name (size) Qty Price Total  
    /^(.+?\([^)]+\))\s+(\d+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})$/,
    // Simple format: Item Name Price
    /^(.+?)\s+(\d+\.\d{2})$/,
    // Format with Rs.: Item Name Rs. Amount
    /^(.+?)\s+Rs\.\s*(\d+\.\d{2})$/,
    // Quantity format: Item Name x Qty Amount
    /^(.+?)\s*x\s*(\d+)\s+(\d+\.\d{2})$/
  ];
  
  // Look for item section markers
  let itemSectionStart = -1;
  let itemSectionEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Find start of items section
    if (itemSectionStart === -1 && (
      line.includes('item') || 
      line.includes('qty') || 
      line.includes('price') || 
      line.includes('total')
    )) {
      itemSectionStart = i + 1;
      console.log(`Found item section start at line ${itemSectionStart}: ${lines[i]}`);
    }
    
    // Find end of items section
    if (itemSectionStart !== -1 && (
      line.includes('subtotal') || 
      line.includes('gst') || 
      line.includes('tax') || 
      line.includes('total amount') ||
      line.includes('paid via')
    )) {
      itemSectionEnd = i - 1;
      console.log(`Found item section end at line ${itemSectionEnd}: ${lines[i]}`);
      break;
    }
  }
  
  // If we didn't find clear markers, use educated guesses
  if (itemSectionStart === -1) {
    itemSectionStart = Math.min(8, Math.floor(lines.length * 0.3));
  }
  if (itemSectionEnd === -1) {
    itemSectionEnd = Math.max(lines.length - 5, Math.ceil(lines.length * 0.7));
  }
  
  console.log(`Processing items from line ${itemSectionStart} to ${itemSectionEnd}`);
  
  // Process the item section
  for (let i = itemSectionStart; i <= itemSectionEnd && i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.length < 3 || shouldSkipLine(line)) {
      continue;
    }
    
    console.log(`Processing line ${i}: "${line}"`);
    
    // Try Pakistani-specific patterns first
    let itemFound = false;
    
    for (const pattern of pakistaniPatterns) {
      const match = line.match(pattern);
      if (match) {
        let itemName, amount, quantity = 1;
        
        if (match.length === 5) {
          // Format: Item Qty Price Total
          itemName = cleanItemText(match[1]);
          quantity = parseInt(match[2]);
          amount = match[4]; // Use total, not unit price
        } else if (match.length === 4) {
          // Format: Item x Qty Amount
          itemName = cleanItemText(match[1]);
          quantity = parseInt(match[2]);
          amount = match[3];
        } else if (match.length === 3) {
          // Format: Item Price or Item Rs. Price
          itemName = cleanItemText(match[1]);
          amount = match[2];
        }
        
        if (itemName && itemName.length >= 2 && amount && parseFloat(amount) > 0) {
          // Add quantity indicator if more than 1
          const finalName = quantity > 1 ? `${itemName} (${quantity}x)` : itemName;
          
          items.push({
            name: finalName,
            amount: amount,
            category: guessCategoryFromItemName(itemName),
            date: receiptDate
          });
          
          console.log(`✅ Extracted item: ${finalName} - Rs. ${amount}`);
          itemFound = true;
          break;
        }
      }
    }
    
    // If no pattern matched, try generic extraction
    if (!itemFound) {
      // Look for any line with a price-like number
      const priceMatch = line.match(/(\d+\.\d{2})/);
      if (priceMatch) {
        const price = priceMatch[1];
        // Get everything before the price as item name
        const nameEnd = line.indexOf(price);
        if (nameEnd > 3) {
          let itemName = line.substring(0, nameEnd).trim();
          itemName = cleanItemText(itemName);
          
          if (itemName.length >= 2 && parseFloat(price) > 0) {
            items.push({
              name: itemName,
              amount: price,
              category: guessCategoryFromItemName(itemName),
              date: receiptDate
            });
            console.log(`✅ Generic extraction: ${itemName} - Rs. ${price}`);
          }
        }
      }
    }
  }
  
  console.log(`Extracted ${items.length} total items from receipt`);
  
  // Return deduped items sorted by price (highest first)
  return deduplicateItems(items);
}

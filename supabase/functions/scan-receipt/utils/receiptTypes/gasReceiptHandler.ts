
// Functions specialized for gas receipt processing

import { shouldSkipLine } from "../items/itemHelpers.ts";

/**
 * Extract items from a gas receipt
 */
export function extractGasReceiptItems(lines: string[], storeName: string): Array<{name: string; amount: string; category: string}> {
  const items = [];
  let fuelAmount = "0.00";
  let fuelType = "Fuel";
  let liters = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Look for price indicator
    if (line.includes('price') || line.includes('amount') || line.includes('total')) {
      const priceMatch = lines[i].match(/[$]?(\d+\.\d{2})/);
      if (priceMatch) {
        fuelAmount = priceMatch[1];
      }
    }
    
    // Look for fuel type
    if (line.includes('unleaded') || 
        line.includes('diesel') || 
        line.includes('premium') || 
        line.includes('regular') ||
        line.includes('supreme') ||
        line.includes('e10') ||
        line.includes('ethanol')) {
      fuelType = lines[i].replace(/\d+/g, '').trim();
    }
    
    // Look for bronze/silver/gold indicators (common for fuel types)
    if (line.includes('bronze') || 
        line.includes('silver') || 
        line.includes('gold') ||
        line.includes('platinum')) {
      fuelType = lines[i].trim();
    }
    
    // Look for volume
    if (line.includes('litre') || 
        line.includes('liter') || 
        line.includes('gallon') ||
        line.includes('l:') ||
        line.includes('litres:')) {
      const volumeMatch = lines[i].match(/(\d+\.\d+)/);
      if (volumeMatch) {
        liters = volumeMatch[1];
      }
    }
  }
  
  // Create the fuel item with all information
  let fuelName = fuelType;
  if (liters) {
    fuelName += ` (${liters} L)`;
  }
  
  if (parseFloat(fuelAmount) > 0) {
    items.push({
      name: fuelName,
      amount: fuelAmount,
      category: "Transportation"
    });
  }
  
  // Look for additional purchases at the gas station
  for (let i = 0; i < lines.length; i++) {
    // Skip lines that clearly aren't item descriptions
    if (shouldSkipLine(lines[i])) continue;
    
    // Look for price pattern at the end of a line
    const priceMatch = lines[i].match(/(.+)\s+[$]?(\d+\.\d{2})$/);
    if (priceMatch && parseFloat(priceMatch[2]) > 0 && !isFuelLine(priceMatch[1].toLowerCase())) {
      items.push({
        name: priceMatch[1].trim(),
        amount: priceMatch[2],
        category: "Shopping" // Most gas station purchases are convenience items
      });
    }
  }
  
  return items;
}

// Check if a line is related to fuel
function isFuelLine(line: string): boolean {
  return line.includes('fuel') ||
         line.includes('gas') ||
         line.includes('diesel') ||
         line.includes('unleaded') ||
         line.includes('premium') ||
         line.includes('regular') ||
         line.includes('litre') ||
         line.includes('liter') ||
         line.includes('gallon') ||
         line.includes('pump');
}

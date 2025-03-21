
// Functions for extracting store information from receipt text

// Identify store name from receipt
export function identifyStoreName(lines: string[]): string {
  console.log("Identifying store from receipt header");
  
  // Check first few lines (typically where store name is)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    // Skip likely non-store-name lines
    if (shouldSkipLine(lines[i])) {
      continue;
    }
    
    // Process store name
    if (lines[i].length > 2 && lines[i].length < 40) {
      return cleanStoreName(lines[i]);
    }
  }
  
  // Special case for well-known stores like Shell that might be preceded by indicators
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('shell') || 
        line.includes('exxon') || 
        line.includes('mobil') ||
        line.includes('bp') ||
        line.includes('chevron') ||
        line.includes('walmart') ||
        line.includes('target') ||
        line.includes('costco') ||
        line.includes('kroger') ||
        line.includes('publix') ||
        line.includes('safeway') ||
        line.includes('starbucks') ||
        line.includes('mcdonald')) {
      return cleanStoreName(lines[i]);
    }
  }
  
  // Special case for receipts with store ID after the name
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].match(/\b(store|st|str)[\s\.:#]?\s*\d+\b/i)) {
      // This is likely a line with the store name before the store ID
      const storePart = lines[i].replace(/\b(store|st|str)[\s\.:#]?\s*\d+\b/i, '').trim();
      if (storePart.length > 2) {
        return cleanStoreName(storePart);
      }
    }
  }
  
  // Fallback to common business identifiers
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('inc.') || 
        line.includes('llc') || 
        line.includes('ltd') || 
        line.includes('co.') ||
        line.includes('corporation') ||
        line.includes('company')) {
      return cleanStoreName(lines[i]);
    }
  }
  
  // Last resort: look for names in the header section
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    // Skip very short lines and obvious non-store lines
    if (lines[i].length < 3 || shouldSkipLine(lines[i])) {
      continue;
    }
    
    // If we have a line that looks like a name (caps, not too long or short)
    if (lines[i].length > 3 && lines[i].length < 40 && hasCapitalLetters(lines[i])) {
      return cleanStoreName(lines[i]);
    }
  }
  
  // If we get here, we couldn't find a likely store name
  // Guess based on the entire receipt content
  const fullText = lines.join(' ').toLowerCase();
  
  if (fullText.includes('gas') || 
      fullText.includes('fuel') || 
      fullText.includes('petrol') ||
      fullText.includes('pump') ||
      fullText.includes('shell') ||
      fullText.includes('exxon') ||
      fullText.includes('mobil') ||
      fullText.includes('bp') ||
      fullText.includes('chevron')) {
    return "Gas Station";
  }
  
  if (fullText.includes('grocery') || 
      fullText.includes('supermarket') || 
      fullText.includes('market') ||
      fullText.includes('produce')) {
    return "Grocery Store";
  }
  
  if (fullText.includes('restaurant') || 
      fullText.includes('cafe') || 
      fullText.includes('menu') ||
      fullText.includes('kitchen') ||
      fullText.includes('food') ||
      fullText.includes('server')) {
    return "Restaurant";
  }
  
  return "Store";
}

// Check if we should skip this line for store name determination
function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  return lowerLine.includes('receipt') ||
         lowerLine.includes('tel:') ||
         lowerLine.includes('phone') ||
         lowerLine.includes('fax') ||
         lowerLine.includes('www.') ||
         lowerLine.includes('http') ||
         lowerLine.includes('date') ||
         lowerLine.includes('time') ||
         lowerLine.includes('terminal') ||
         lowerLine.includes('order') ||
         lowerLine.includes('trans') ||
         lowerLine.includes('tran') ||
         lowerLine.includes('no.') ||
         lowerLine.includes('number') ||
         lowerLine.includes('customer') ||
         lowerLine.includes('copy') ||
         lowerLine.includes('thank you') ||
         lowerLine.match(/^\d+\/\d+\/\d+$/) ||  // Date pattern
         lowerLine.match(/^\d+:\d+/) ||         // Time pattern
         lowerLine.match(/^\d+\.\d{2}$/) ||     // Price pattern
         lowerLine.match(/^tel/i) ||
         lowerLine.match(/^fax/i) ||
         lowerLine.match(/^[#\-*=]{2,}$/);      // Separator line
}

// Clean store name
function cleanStoreName(name: string): string {
  let cleaned = name.trim()
    // Remove common prefixes
    .replace(/^(welcome to|welcome|at)\s+/i, '')
    // Remove common suffixes
    .replace(/\s+(receipt|store|market|supermarket|#\d+)$/i, '')
    // Remove numbers at the end
    .replace(/\s+\d+$/, '')
    // Remove special characters
    .replace(/[^\w\s\-'&,]/g, '')
    // Convert multiple spaces to single space
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Capitalize words
  cleaned = cleaned.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return cleaned;
}

// Check if a string has capital letters (useful for detecting names)
function hasCapitalLetters(str: string): boolean {
  return /[A-Z]/.test(str);
}

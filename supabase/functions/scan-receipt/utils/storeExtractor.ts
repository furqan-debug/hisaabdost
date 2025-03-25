
/**
 * Extracts the store or merchant name from receipt lines
 */
export function extractStoreName(lines: string[]): string {
  if (!lines || lines.length === 0) {
    return 'Unknown';
  }
  
  // First check for explicit merchant name indicators
  const merchantPatterns = [
    /merchant:?\s*(.+)/i,
    /store:?\s*(.+)/i,
    /vendor:?\s*(.+)/i,
    /seller:?\s*(.+)/i,
    /restaurant:?\s*(.+)/i
  ];
  
  for (const line of lines) {
    for (const pattern of merchantPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        return clean(match[1]);
      }
    }
  }
  
  // If no explicit merchant indicator, the store name is typically one of the first few lines
  // We'll try a heuristic approach
  
  // Skip very short lines
  const potentialNames = lines.slice(0, 5).filter(line => line.length > 3);
  
  if (potentialNames.length === 0) {
    return 'Unknown';
  }
  
  // Look for capitalized text that's not a date, address, or receipt number
  for (const line of potentialNames) {
    // Skip common non-merchant lines
    if (line.match(/^(date|time|receipt|tel|phone|tax|invoice)/i)) {
      continue;
    }
    
    // Skip dates
    if (line.match(/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/) || 
        line.match(/^\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2}/)) {
      continue;
    }
    
    // Skip phone numbers
    if (line.match(/^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)) {
      continue;
    }
    
    // Skip website URLs
    if (line.toLowerCase().includes('www.') || line.toLowerCase().includes('http')) {
      continue;
    }
    
    // Skip receipt numbers
    if (line.match(/^#\s?\d+/) || line.match(/^order:?\s?\d+/i)) {
      continue;
    }
    
    // Skip address lines with typical street address formats
    if (line.match(/^\d+\s+[a-z\s]+,?\s[a-z\s]+,?\s[a-z]{2}\s+\d{5}/i)) {
      continue;
    }
    
    // This is likely the store name
    return clean(line);
  }
  
  // If we couldn't find a good candidate, use the first line that's not too long or short
  for (const line of potentialNames) {
    if (line.length > 3 && line.length < 40) {
      return clean(line);
    }
  }
  
  // Last resort: just use the first line
  return clean(potentialNames[0]);
}

/**
 * Cleans a potential store name
 */
function clean(text: string): string {
  // Remove leading/trailing spaces
  let cleaned = text.trim();
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(welcome to|thank you for shopping at|receipt from)/i, '').trim();
  
  // Remove trailing stuff after commas or hyphens (likely addresses or branches)
  const commaPos = cleaned.indexOf(',');
  if (commaPos > 0) {
    cleaned = cleaned.substring(0, commaPos).trim();
  }
  
  const dashPos = cleaned.indexOf(' - ');
  if (dashPos > 0) {
    cleaned = cleaned.substring(0, dashPos).trim();
  }
  
  // Ensure proper capitalization if all caps
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 3) {
    cleaned = cleaned.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  
  // Cap the length
  if (cleaned.length > 30) {
    cleaned = cleaned.substring(0, 30);
  }
  
  return cleaned || 'Unknown';
}


// Extract store/merchant name from OCR text
export function extractStoreName(lines: string[]): string {
  // Check the first few lines for store name (typically at the top of receipt)
  const maxLinesToCheck = Math.min(7, lines.length);
  
  for (let i = 0; i < maxLinesToCheck; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines
    if (line.length < 3) continue;
    
    // Skip lines with common non-store patterns
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|\d{2}\/\d{2}\/\d{4}|thank|you|www|http|order|number/i)) {
      continue;
    }
    
    // Potential store name patterns:
    
    // 1. All uppercase is often a store name logo
    if (line === line.toUpperCase() && line.length > 3 && !/^\d+$/.test(line)) {
      return formatStoreName(line);
    }
    
    // 2. First substantive line that's not a date, number, etc.
    if (!line.match(/^\d/) && !line.match(/^[A-Z]{1,3}$/) && line.length > 3) {
      return formatStoreName(line);
    }
  }
  
  // If no clear store name found in header, try to find in URL/website mentions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Look for website mentions
    const websiteMatch = line.match(/(?:www\.|http:\/\/|https:\/\/)([a-zA-Z0-9-]+)(?:\.[a-zA-Z0-9-]+)+/);
    if (websiteMatch && websiteMatch[1] && websiteMatch[1].length > 3) {
      return formatStoreName(websiteMatch[1]);
    }
  }
  
  return "Store";  // Default if no store name found
}

// Format store name for readability
function formatStoreName(name: string): string {
  // Convert to lowercase
  let formattedName = name.toLowerCase();
  
  // Remove non-alphanumeric characters
  formattedName = formattedName.replace(/[^a-z0-9\s]/g, ' ').trim();
  
  // Remove excess spaces
  formattedName = formattedName.replace(/\s+/g, ' ');
  
  // Capitalize words
  formattedName = formattedName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return formattedName;
}

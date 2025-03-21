
// Function to extract date from receipt text

// Regular expressions for different date formats
const datePatterns = [
  /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,  // MM/DD/YYYY or DD/MM/YYYY
  /(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/i,     // YYYY-MM-DD
  /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\s+(\d{2,4})/i,  // DD Month YYYY
  /([a-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{2,4})/i,  // Month DD YYYY
  /([a-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?[\s,]+(\d{2,4})/i  // Month DD, YYYY
];

// List of month names and abbreviations for parsing text dates
const months: {[key: string]: number} = {
  'jan': 1, 'january': 1,
  'feb': 2, 'february': 2,
  'mar': 3, 'march': 3,
  'apr': 4, 'april': 4,
  'may': 5, 'may': 5,
  'jun': 6, 'june': 6,
  'jul': 7, 'july': 7,
  'aug': 8, 'august': 8,
  'sep': 9, 'september': 9,
  'oct': 10, 'october': 10,
  'nov': 11, 'november': 11,
  'dec': 12, 'december': 12
};

// Extract date from receipt text
export function extractDate(lines: string[]): string {
  console.log("Extracting date from receipt...");
  
  // First look for lines that explicitly mention date
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].toLowerCase();
    
    if (line.includes("date") || line.includes("issued") || line.includes("transaction")) {
      const result = extractDateFromLine(line);
      if (result) {
        console.log(`Found date in date-labeled line: ${result}`);
        return result;
      }
    }
  }
  
  // Then look through all lines for dates
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const result = extractDateFromLine(lines[i]);
    if (result) {
      console.log(`Found date in line ${i}: ${result}`);
      return result;
    }
  }
  
  // If we haven't found a date yet, look for lines that might contain just a date
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    // Check if the line contains mostly just a date (short line)
    if (line.length < 20) {
      for (const pattern of datePatterns) {
        if (pattern.test(line)) {
          const result = extractDateFromLine(line);
          if (result) {
            console.log(`Found date in short line ${i}: ${result}`);
            return result;
          }
        }
      }
    }
  }
  
  // As a fallback, return today's date
  const today = new Date().toISOString().split('T')[0];
  console.log(`No date found, using today's date: ${today}`);
  return today;
}

// Parse a line of text to extract a date
function extractDateFromLine(line: string): string | null {
  for (const pattern of datePatterns) {
    const match = line.match(pattern);
    if (match) {
      try {
        return formatDateFromMatch(match);
      } catch (e) {
        console.log(`Error parsing date: ${e}`);
        // Continue to next pattern
      }
    }
  }
  
  return null;
}

// Convert matched date parts to ISO format
function formatDateFromMatch(match: RegExpMatchArray): string | null {
  let year: number;
  let month: number;
  let day: number;
  
  // Try to determine the date format from the match
  const fullMatch = match[0].toLowerCase();
  
  // Handle numeric dates (MM/DD/YYYY or YYYY-MM-DD)
  if (fullMatch.match(/\d+[\/\.\-]\d+[\/\.\-]\d+/)) {
    if (match[1].length === 4) {
      // YYYY-MM-DD format
      year = parseInt(match[1]);
      month = parseInt(match[2]);
      day = parseInt(match[3]);
    } else {
      // MM/DD/YYYY or DD/MM/YYYY format - assume MM/DD/YYYY for US receipts
      month = parseInt(match[1]);
      day = parseInt(match[2]);
      year = parseInt(match[3]);
      
      // Handle 2-digit years
      if (year < 100) {
        year = year < 50 ? 2000 + year : 1900 + year;
      }
    }
  } 
  // Handle text month formats
  else if (fullMatch.match(/[a-z]/i)) {
    let monthStr = '';
    let dayStr = '';
    let yearStr = '';
    
    // Try to identify which part is the month name
    for (let i = 1; i <= 3; i++) {
      if (match[i] && isNaN(Number(match[i])) && match[i].length >= 3) {
        monthStr = match[i].toLowerCase();
        // The other parts are day and year
        const otherParts = [1, 2, 3].filter(j => j !== i).map(j => match[j]);
        // Sort to get year (larger number) and day
        otherParts.sort((a, b) => parseInt(b) - parseInt(a));
        yearStr = otherParts[0];
        dayStr = otherParts[1];
        break;
      }
    }
    
    // Parse the month name
    if (monthStr) {
      // Get just the first 3 chars of month name to handle abbreviations
      const monthKey = monthStr.substring(0, 3);
      if (months[monthKey]) {
        month = months[monthKey];
        day = parseInt(dayStr);
        year = parseInt(yearStr);
        
        // Handle 2-digit years
        if (year < 100) {
          year = year < 50 ? 2000 + year : 1900 + year;
        }
      } else {
        return null; // Invalid month name
      }
    } else {
      return null; // Couldn't identify month
    }
  } else {
    return null; // Unrecognized format
  }
  
  // Basic validation
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) {
    return null;
  }
  
  // Format as YYYY-MM-DD
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

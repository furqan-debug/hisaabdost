// Main function to parse receipt text
export function parseReceiptText(text: string) {
  console.log("🔍 Received receipt text for parsing:", text.substring(0, 100) + "...");

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.warn("⚠️ Empty or invalid receipt text provided");
    return {
      merchant: "Unknown",
      items: [],
      date: new Date().toISOString().split('T')[0],
      total: "0.00"
    };
  }

  try {
    const merchant = extractMerchant(text);
    const items = extractItems(text);
    const date = extractDate(text);
    const total = calculateTotal(items);

    console.log("✅ Parsed receipt data:", { merchant, itemCount: items.length, date, total });

    return { merchant, items, date, total };
  } catch (error) {
    console.error("❌ Error parsing receipt:", error);

    return {
      merchant: "Unknown Merchant",
      items: [],
      date: new Date().toISOString().split('T')[0],
      total: "0.00"
    };
  }
}

// Extract store name from receipt text
function extractMerchant(text: string) {
  const lines = text.trim().split('\n');

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    if (line.length < 3 || /^\d+$/.test(line)) continue;
    
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|thank|you/i)) continue;

    if (line.toUpperCase() === line && line.length > 3) return line;
    
    if (!line.match(/^\d/) && line.length > 3) return line;
  }

  return "Unknown Merchant";
}

// Extract date from receipt text
function extractDate(text: string) {
  const datePatterns = [
    /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/,  
    /Date:?\s*(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/i,  
    /(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/,  
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let year = match[3];
      if (year.length === 2) {
        year = year < "50" ? "20" + year : "19" + year;
      }

      let month = match[1].padStart(2, '0');
      let day = match[2].padStart(2, '0');

      if (pattern.toString().includes('(\\d{4})')) {
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      }

      return `${year}-${month}-${day}`;
    }
  }

  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Extract items and prices from receipt text
function extractItems(text: string) {
  const lines = text.trim().split('\n');
  const items = [];

  const startIndex = Math.min(5, Math.floor(lines.length * 0.15));
  const endIndex = Math.max(lines.length - 5, Math.ceil(lines.length * 0.8));

  console.log(`🔍 Processing potential item lines from ${startIndex} to ${endIndex}`);

  const itemPatterns = [
    /(.+?)\s+(\d+\.\d{2})$/,  
    /(.+?)\s{2,}(\d+\.\d{2})$/,  
    /(.+?)\$\s*(\d+\.\d{2})$/,  
    /(.+?)\s+\$?(\d+\.\d{2})$/,  
  ];

  const nonItemPatterns = [
    /subtotal|tax|total|change|balance|card|cash|payment|thank|you/i,
    /\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}/,  
    /^\s*\d+\s*$/,  
    /^\s*\*+\s*$/,  
    /^\s*\-+\s*$/  
  ];

  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    if (line.length < 3 || nonItemPatterns.some(pattern => line.match(pattern))) continue;

    let matched = false;
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1].trim();
        const amount = match[2];
        const price = parseFloat(amount);

        if (name.length > 1 && price > 0 && price < 10000) {
          items.push({ name, amount });
          matched = true;
          break;
        }
      }
    }

    if (!matched && i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      const priceOnly = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);

      if (priceOnly && line.length > 2 && !nonItemPatterns.some(pattern => line.match(pattern))) {
        items.push({ name: line, amount: priceOnly[1] });
        i++;
      }
    }
  }

  const uniqueItems = new Map();
  items.forEach(item => {
    const key = item.name.toLowerCase();
    if (!uniqueItems.has(key) || parseFloat(uniqueItems.get(key).amount) < parseFloat(item.amount)) {
      uniqueItems.set(key, item);
    }
  });

  return Array.from(uniqueItems.values()).sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
}

// Calculate the total based on the extracted items
function calculateTotal(items: Array<{ name: string, amount: string }>) {
  if (items.length === 0) return "0.00";
  
  return items.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2);
}

// Utility function to clean text
export function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

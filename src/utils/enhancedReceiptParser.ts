
import { extractMerchant } from "./receiptParser/merchantExtractor";

// Enhanced date extraction with better patterns
export function extractDateEnhanced(text: string): string | null {
  const datePatterns = [
    // ISO format variations
    /\b(\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})\b/,
    /\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{4})\b/,
    /\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2})\b/,
    
    // Written month formats
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{2,4}\b/i,
    /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{2,4}\b/i,
    
    // Transaction date patterns
    /\bDate:\s*([a-zA-Z0-9\-\.\/,\s]+)\b/i,
    /\bTransaction Date:\s*([a-zA-Z0-9\-\.\/,\s]+)\b/i,
    /\bPurchase Date:\s*([a-zA-Z0-9\-\.\/,\s]+)\b/i,
    
    // Time-based patterns (today/yesterday)
    /\b(Today|Yesterday)\b/i,
    
    // Receipt-specific patterns
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\s+\d{1,2}:\d{2}\b/, // MM/DD/YYYY HH:MM
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      try {
        if (match[1].toLowerCase() === 'today') {
          return new Date().toISOString().split('T')[0];
        } else if (match[1].toLowerCase() === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday.toISOString().split('T')[0];
        }
        
        const dateObj = new Date(match[1]);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
      } catch {
        continue;
      }
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

// Enhanced amount extraction with better parsing
export function extractAmountsEnhanced(lines: string[]): { name: string; amount: number }[] {
  const items: { name: string; amount: number }[] = [];
  const processedLines = new Set<string>();
  
  // Enhanced patterns for better item detection
  const patterns = [
    // Standard item with price
    /([\w\s\&\-\.,'"\(\)]+?)\s+([\$]?[\d,]+\.?\d{0,2})$/,
    
    // Quantity patterns
    /(\d+)\s*[xX@]\s*([\w\s\&\-\.,'"\(\)]+?)\s+([\$]?[\d,]+\.?\d{0,2})$/,
    /(\d+)\s+([\w\s\&\-\.,'"\(\)]+?)\s+([\$]?[\d,]+\.?\d{0,2})$/,
    
    // Price first patterns
    /^([\$]?[\d,]+\.?\d{0,2})\s+([\w\s\&\-\.,'"\(\)]+?)$/,
    
    // SKU/Product code patterns
    /^(\d+)\s+([\w\s\&\-\.,'"\(\)]+?)\s+([\$]?[\d,]+\.?\d{0,2})$/,
    
    // Department store patterns
    /([\w\s\&\-\.,'"\(\)]+?)\s+(\d{4,})\s+([\$]?[\d,]+\.?\d{0,2})$/,
  ];
  
  // Skip these common non-item lines
  const skipPatterns = [
    /total|subtotal|tax|change|cash|card|date|time|thank|welcome|store|receipt/i,
    /^\s*[\d\-\s]+$/, // Just numbers and dashes
    /^[\*\-=\+\s]+$/, // Just symbols
    /^\s*$/, // Empty lines
    /phone|address|www\.|\.com/i, // Contact info
  ];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines or already processed
    if (!trimmedLine || processedLines.has(trimmedLine)) continue;
    
    // Skip common non-item patterns
    if (skipPatterns.some(pattern => pattern.test(trimmedLine))) continue;
    
    let matched = false;
    
    for (const pattern of patterns) {
      const match = trimmedLine.match(pattern);
      
      if (match) {
        let itemName: string;
        let amount: number;
        
        if (pattern.toString().includes('\\d+\\s*[xX@]\\s*')) {
          // Quantity with x or @
          const qty = parseInt(match[1]);
          itemName = `${match[2].trim()}${qty > 1 ? ` (${qty}x)` : ''}`;
          amount = parseFloat(match[3].replace(/[$,]/g, ''));
        } else if (pattern.toString().includes('^([\\$]?[\\d,]+')) {
          // Price first
          itemName = match[2].trim();
          amount = parseFloat(match[1].replace(/[$,]/g, ''));
        } else if (pattern.toString().includes('(\\d{4,})')) {
          // Department store with SKU
          itemName = match[1].trim();
          amount = parseFloat(match[3].replace(/[$,]/g, ''));
        } else {
          // Standard pattern
          itemName = match[1].trim();
          amount = parseFloat(match[2].replace(/[$,]/g, ''));
        }
        
        // Clean and validate
        itemName = cleanItemNameEnhanced(itemName);
        
        if (itemName && !isNaN(amount) && amount > 0 && amount < 10000) {
          items.push({ name: itemName, amount });
          processedLines.add(trimmedLine);
          matched = true;
          break;
        }
      }
    }
    
    // Fallback: look for any price pattern in the line
    if (!matched) {
      const priceMatch = trimmedLine.match(/([\d,]+\.\d{2})/);
      if (priceMatch) {
        const amount = parseFloat(priceMatch[1].replace(',', ''));
        if (!isNaN(amount) && amount > 0 && amount < 10000) {
          const priceIndex = trimmedLine.indexOf(priceMatch[1]);
          if (priceIndex > 3) {
            let itemName = trimmedLine.substring(0, priceIndex).trim();
            itemName = cleanItemNameEnhanced(itemName);
            
            if (itemName && itemName.length > 2) {
              items.push({ name: itemName, amount });
              processedLines.add(trimmedLine);
            }
          }
        }
      }
    }
  }
  
  return items;
}

// Enhanced item name cleaning
function cleanItemNameEnhanced(name: string): string {
  let cleaned = name.trim()
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\d\s]*[xX*@]?\s*/i, '')
    .replace(/\s*\(\d+[xX*]\)$/i, '')
    .replace(/[\.,;:]+$/, '')
    .replace(/\$+/g, '')
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/Item\s*#?\d+\s*/i, '')
    .replace(/SKU\s*:?\s*\d+/i, '')
    .replace(/UPC\s*:?\s*\d+/i, '');
  
  // Remove common prefixes and suffixes
  const patterns = [
    /^(qty|quantity|sku|item|product|dept)\s*:?\s*/i,
    /\s*(each|ea|pc|pcs|piece|pieces)$/i,
  ];
  
  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Capitalize first letter of each word
  cleaned = cleaned.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  
  return cleaned.trim();
}

// Enhanced categorization with more patterns
export function categorizeExpenseEnhanced(itemName: string, merchantName?: string): string {
  const categories: Record<string, string[]> = {
    Groceries: [
      "milk", "bread", "eggs", "cheese", "butter", "yogurt", "meat", "chicken", "beef", "fish",
      "apple", "banana", "orange", "tomato", "lettuce", "onion", "potato", "carrot",
      "rice", "pasta", "cereal", "flour", "sugar", "salt", "oil", "supermarket", "grocery",
      "produce", "dairy", "vegetable", "fruit", "organic", "fresh", "frozen"
    ],
    Dining: [
      "burger", "pizza", "coffee", "tea", "sandwich", "salad", "soup", "pasta", "sushi",
      "restaurant", "cafe", "meal", "lunch", "dinner", "breakfast", "drink", "beverage",
      "takeout", "delivery", "fast food", "dine", "bar", "pub", "bistro"
    ],
    Transport: [
      "uber", "lyft", "taxi", "gas", "gasoline", "fuel", "bus", "train", "subway", "metro",
      "fare", "parking", "toll", "transport", "ride", "trip", "station", "airport"
    ],
    Shopping: [
      "clothing", "shirt", "pants", "shoes", "dress", "jacket", "electronics", "phone",
      "computer", "tablet", "headphones", "amazon", "store", "shop", "retail", "mall",
      "department", "target", "walmart", "costco", "purchase", "buy"
    ],
    Health: [
      "doctor", "medicine", "pharmacy", "prescription", "medical", "health", "hospital",
      "clinic", "vitamin", "supplement", "drug", "pills", "treatment", "therapy"
    ],
    Entertainment: [
      "movie", "theater", "cinema", "ticket", "event", "concert", "show", "game", "gaming",
      "entertainment", "netflix", "spotify", "music", "streaming", "subscription"
    ],
    Utilities: [
      "electricity", "electric", "water", "gas", "utility", "bill", "phone", "internet",
      "cable", "service", "payment", "monthly", "annual"
    ]
  };

  const combinedText = `${itemName} ${merchantName || ''}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return category;
    }
  }
  
  return "Other";
}

// Enhanced total extraction
function extractTotalEnhanced(text: string): number {
  const totalPatterns = [
    /total[\s:]*\$?(\d+\.\d{2})/i,
    /amount[\s:]*\$?(\d+\.\d{2})/i,
    /balance[\s:]*\$?(\d+\.\d{2})/i,
    /grand total[\s:]*\$?(\d+\.\d{2})/i,
    /final[\s:]*\$?(\d+\.\d{2})/i,
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  
  return 0;
}

// Main enhanced processing function
export function processReceiptTextEnhanced(text: string) {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const date = extractDateEnhanced(text) || new Date().toISOString().split('T')[0];
  const merchant = extractMerchant(lines);
  const items = extractAmountsEnhanced(lines);
  
  // Enhanced item processing with better categorization
  const enhancedItems = items.map(item => ({
    name: item.name,
    amount: item.amount,
    category: categorizeExpenseEnhanced(item.name, merchant)
  }));
  
  let total = 0;
  if (enhancedItems.length > 0) {
    total = enhancedItems.reduce((sum, item) => sum + item.amount, 0);
  } else {
    total = extractTotalEnhanced(text);
  }

  return {
    date,
    merchant,
    items: enhancedItems,
    total,
    success: enhancedItems.length > 0 || total > 0,
    confidence: enhancedItems.length > 0 ? 'high' : total > 0 ? 'medium' : 'low'
  };
}

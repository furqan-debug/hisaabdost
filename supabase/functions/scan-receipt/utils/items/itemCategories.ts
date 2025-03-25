
// Map common items to expense categories
const categoryMap: Record<string, string[]> = {
  "Food": [
    "grocery", "groceries", "food", "meal", "burger", "pizza", "restaurant", 
    "cafe", "coffee", "lunch", "dinner", "breakfast", "snack", "drink", 
    "beverage", "beer", "wine", "liquor", "takeout", "bakery", "meat", 
    "produce", "fruit", "vegetable", "dairy", "milk", "cheese", "yogurt",
    "fish", "chips", "sandwich", "salad", "dessert", "cake", "ice cream",
    "chocolate", "candy", "soda", "juice", "water", "tea"
  ],
  "Transportation": [
    "gas", "fuel", "petrol", "diesel", "car", "auto", "vehicle", "repair", 
    "maintenance", "oil", "tire", "tyre", "battery", "parking", "toll", 
    "fare", "ticket", "uber", "lyft", "taxi", "cab", "bus", "train", 
    "subway", "metro", "transit", "transport", "flight", "airline"
  ],
  "Utilities": [
    "electric", "electricity", "water", "gas", "power", "utility", "sewage", 
    "garbage", "trash", "waste", "internet", "wifi", "phone", "mobile", 
    "cell", "cable", "tv", "television", "streaming", "subscription"
  ],
  "Housing": [
    "rent", "mortgage", "house", "apartment", "condo", "housing", "property", 
    "maintenance", "repair", "improvement", "furniture", "decor", "appliance", 
    "cleaning", "service", "lawn", "garden", "home", "insurance"
  ],
  "Entertainment": [
    "movie", "theatre", "theater", "concert", "show", "event", "ticket", 
    "game", "sport", "hobby", "book", "music", "subscription", "streaming", 
    "netflix", "hulu", "spotify", "disney", "amazon", "apple", "video", "audio"
  ],
  "Health": [
    "doctor", "medical", "medicine", "health", "dental", "vision", "prescription", 
    "drug", "fitness", "gym", "exercise", "vitamin", "supplement", "therapy", 
    "hospital", "clinic", "insurance"
  ],
  "Shopping": [
    "clothing", "clothes", "apparel", "fashion", "accessory", "jewelry", 
    "electronic", "device", "gadget", "technology", "computer", "laptop", 
    "phone", "retail", "store", "mall", "online", "amazon", "ebay", "etsy", 
    "walmart", "target", "best buy", "apple", "purchase", "shopping"
  ],
  "Personal": [
    "haircut", "salon", "spa", "beauty", "cosmetic", "makeup", "skincare", 
    "personal", "care", "hygiene", "toiletry", "laundry", "dry clean", 
    "service", "education", "course", "class", "tuition", "school", "college"
  ],
  "Business": [
    "office", "supply", "business", "professional", "service", "consulting", 
    "software", "subscription", "license", "fee", "dues", "membership"
  ],
  "Bills": [
    "bill", "payment", "fee", "subscription", "insurance", "tax", "loan", 
    "credit", "debt", "finance", "interest", "bank", "service"
  ]
};

// Guess the most likely category for an item based on its name
export function guessCategoryFromItemName(itemName: string): string {
  if (!itemName) return "Other";
  
  const lowerName = itemName.toLowerCase();
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Special case detection for specific patterns
  if (lowerName.match(/\d+\s*x/)) {
    // If it has a quantity, it's likely a grocery/food item
    return "Food";
  }
  
  // Default category if no match found
  return "Other";
}

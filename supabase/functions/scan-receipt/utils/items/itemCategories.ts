
// Map common item words to expense categories
const categoryKeywords: Record<string, string[]> = {
  "Groceries": [
    "apple", "banana", "bread", "milk", "cheese", "yogurt", "cereal", "eggs", 
    "butter", "chicken", "beef", "pork", "rice", "pasta", "vegetable", "fruit",
    "juice", "soda", "water", "coffee", "tea", "sugar", "flour", "grocery", "food",
    "produce", "meat", "dairy", "bakery", "organic", "tomato", "potato", "onion",
    "carrot", "lettuce", "cucumber", "pepper", "beans", "frozen", "snack", "cookie",
    "chip", "sauce", "oil", "vinegar", "spice", "herb", "condiment"
  ],
  "Dining": [
    "restaurant", "cafe", "diner", "eatery", "bistro", "pub", "bar", "grill", 
    "steakhouse", "pizzeria", "sushi", "burger", "taco", "sandwich", "coffee",
    "breakfast", "lunch", "dinner", "meal", "entree", "appetizer", "dessert",
    "delivery", "takeout", "doordash", "ubereats", "grubhub", "mcdonalds", 
    "wendys", "subway", "chipotle", "starbucks", "dunkin"
  ],
  "Transportation": [
    "gas", "fuel", "petrol", "diesel", "uber", "lyft", "taxi", "cab", "fare",
    "rail", "train", "subway", "bus", "transit", "transport", "commute", "toll",
    "parking", "garage", "car", "vehicle", "auto", "tire", "oil", "change", 
    "service", "repair", "maintenance", "wash", "ticket", "pass", "metro"
  ],
  "Housing": [
    "rent", "mortgage", "landlord", "property", "apartment", "condo", "house",
    "home", "tenant", "lease", "security", "deposit", "housing", "accommodation",
    "utility", "electric", "gas", "water", "sewage", "garbage", "waste", "internet",
    "cable", "tv", "phone", "furniture", "appliance", "repair", "maintenance"
  ],
  "Entertainment": [
    "movie", "theater", "cinema", "film", "concert", "show", "event", "ticket",
    "sport", "game", "match", "play", "musical", "opera", "performance", "exhibit",
    "museum", "gallery", "park", "zoo", "aquarium", "tour", "festival", "fair",
    "amusement", "entertainment", "netflix", "hulu", "disney", "spotify", "streaming"
  ],
  "Shopping": [
    "clothing", "apparel", "fashion", "accessory", "shoe", "jewelry", "watch",
    "handbag", "purse", "wallet", "backpack", "luggage", "electronic", "device",
    "gadget", "computer", "laptop", "tablet", "phone", "headphone", "speaker",
    "camera", "book", "gift", "present", "souvenir", "decor", "decoration", "retail",
    "store", "shop", "mall", "outlet", "market", "amazon", "walmart", "target"
  ],
  "Healthcare": [
    "doctor", "physician", "medical", "medicine", "health", "healthcare", "clinic",
    "hospital", "emergency", "er", "urgent", "care", "specialist", "dentist", "dental",
    "vision", "eye", "optometrist", "prescription", "pharmacy", "drug", "medication",
    "treatment", "therapy", "physical", "mental", "counseling", "psychology", "insurance"
  ],
  "Personal": [
    "haircut", "salon", "spa", "massage", "beauty", "cosmetic", "makeup", "skincare",
    "nail", "manicure", "pedicure", "barber", "grooming", "hygiene", "personal",
    "care", "toiletry", "vitamin", "supplement", "fitness", "gym", "exercise",
    "workout", "training", "membership", "subscription"
  ],
  "Education": [
    "school", "college", "university", "education", "academic", "tuition", "fee",
    "course", "class", "lecture", "seminar", "workshop", "training", "book", "textbook",
    "notebook", "supply", "material", "equipment", "software", "subscription", "library",
    "research", "study", "student", "test", "exam", "certification", "degree", "diploma"
  ],
  "Utilities": [
    "electric", "electricity", "gas", "water", "sewage", "garbage", "waste", "recycling",
    "internet", "wifi", "broadband", "cable", "tv", "phone", "mobile", "cellular",
    "utility", "bill", "service", "provider", "connection", "usage", "consumption"
  ]
};

// Guess category based on item name
export function guessCategoryFromItemName(itemName: string): string {
  if (!itemName) return "Other";
  
  const normalizedName = itemName.toLowerCase();
  
  // Check if any category keywords match
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Return default category if no match found
  return "Other";
}

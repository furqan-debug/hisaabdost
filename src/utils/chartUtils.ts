
export const CATEGORY_COLORS = {
  "Food": "#FF6B6B",
  "Rent": "#4ECDC4", 
  "Utilities": "#45B7D1",
  "Transportation": "#96CEB4",
  "Entertainment": "#FFEAA7",
  "Shopping": "#DDA0DD",
  "Healthcare": "#98D8C8",
  "Other": "#F7DC6F"
} as const;

export type CategoryType = keyof typeof CATEGORY_COLORS;

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category as CategoryType] || CATEGORY_COLORS["Other"];
};

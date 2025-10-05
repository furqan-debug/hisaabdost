import { 
  Home, Zap, ShoppingCart, Utensils, Car, ShoppingBag, 
  Heart, GraduationCap, RefreshCw, Ticket, Sparkles, 
  Plane, TrendingUp, Gift, MoreHorizontal, LucideIcon 
} from 'lucide-react';

export interface CategoryConfig {
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    name: 'Housing',
    icon: Home,
    color: '#4ECDC4',
    description: 'Rent, Mortgage, Property Repairs'
  },
  {
    name: 'Utilities & Bills',
    icon: Zap,
    color: '#45B7D1',
    description: 'Electricity, Water, Internet, Gas'
  },
  {
    name: 'Groceries',
    icon: ShoppingCart,
    color: '#96CEB4',
    description: 'Supermarket, Food Shopping'
  },
  {
    name: 'Food & Dining',
    icon: Utensils,
    color: '#FF6B6B',
    description: 'Restaurants, Coffee, Takeout'
  },
  {
    name: 'Transportation',
    icon: Car,
    color: '#5DADE2',
    description: 'Fuel, Public Transit, Ride-hailing'
  },
  {
    name: 'Shopping',
    icon: ShoppingBag,
    color: '#DDA0DD',
    description: 'Clothes, Electronics, Household Items'
  },
  {
    name: 'Health & Fitness',
    icon: Heart,
    color: '#F8B4D9',
    description: 'Doctor, Gym, Medicine'
  },
  {
    name: 'Education',
    icon: GraduationCap,
    color: '#F39C12',
    description: 'Courses, Books, Tuition'
  },
  {
    name: 'Subscriptions',
    icon: RefreshCw,
    color: '#9B59B6',
    description: 'Streaming, Apps, Services'
  },
  {
    name: 'Entertainment',
    icon: Ticket,
    color: '#FFEAA7',
    description: 'Movies, Games, Events'
  },
  {
    name: 'Personal Care',
    icon: Sparkles,
    color: '#FD79A8',
    description: 'Salon, Grooming, Beauty'
  },
  {
    name: 'Travel',
    icon: Plane,
    color: '#74B9FF',
    description: 'Flights, Hotels, Trips'
  },
  {
    name: 'Savings & Investments',
    icon: TrendingUp,
    color: '#00B894',
    description: 'Savings, Stocks, Investments'
  },
  {
    name: 'Donations & Gifts',
    icon: Gift,
    color: '#FDA7DF',
    description: 'Charity, Gifts, Donations'
  },
  {
    name: 'Miscellaneous',
    icon: MoreHorizontal,
    color: '#95A5A6',
    description: 'Other Expenses'
  }
];

// Legacy category mapping for backward compatibility
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'Food': 'Food & Dining',
  'Rent': 'Housing',
  'Healthcare': 'Health & Fitness',
  'Other': 'Miscellaneous'
};

// Get all category names
export const getCategoryNames = (): string[] => {
  return DEFAULT_CATEGORIES.map(cat => cat.name);
};

// Get category config by name
export const getCategoryConfig = (name: string): CategoryConfig | undefined => {
  // Check legacy mapping first
  const mappedName = LEGACY_CATEGORY_MAP[name] || name;
  return DEFAULT_CATEGORIES.find(cat => cat.name === mappedName);
};

// Get category color
export const getCategoryColor = (name: string): string => {
  const config = getCategoryConfig(name);
  return config?.color || DEFAULT_CATEGORIES.find(c => c.name === 'Miscellaneous')!.color;
};

// Get category icon
export const getCategoryIcon = (name: string): LucideIcon => {
  const config = getCategoryConfig(name);
  return config?.icon || MoreHorizontal;
};

// Map for colors (for backward compatibility with chart utils)
export const CATEGORY_COLORS = DEFAULT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.name] = cat.color;
  return acc;
}, {} as Record<string, string>);

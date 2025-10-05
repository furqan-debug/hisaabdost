import { useMemo } from 'react';
import { LucideIcon } from 'lucide-react';
import { useCustomCategories } from './useCustomCategories';
import { DEFAULT_CATEGORIES, getCategoryColor } from '@/config/categories';

export interface CategoryOption {
  value: string;
  label: string;
  color: string;
  isCustom: boolean;
  icon?: LucideIcon;
}

export function useAllCategories() {
  const { categories: customCategories, loading } = useCustomCategories();

  const allCategories = useMemo(() => {
    const defaultCategories: CategoryOption[] = DEFAULT_CATEGORIES.map(cat => ({
      value: cat.name,
      label: cat.name,
      color: cat.color,
      isCustom: false,
      icon: cat.icon
    }));

    const customCategoriesFormatted: CategoryOption[] = customCategories.map(cat => ({
      value: cat.name,
      label: cat.name,
      color: cat.color,
      isCustom: true
    }));

    return [...defaultCategories, ...customCategoriesFormatted];
  }, [customCategories]);

  return {
    categories: allCategories,
    loading
  };
}
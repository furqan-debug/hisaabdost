import { useMemo } from 'react';
import { useCustomCategories } from './useCustomCategories';
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';
import { getCategoryColor } from '@/utils/chartUtils';

export interface CategoryOption {
  value: string;
  label: string;
  color: string;
  isCustom: boolean;
}

export function useAllCategories() {
  const { categories: customCategories, loading } = useCustomCategories();

  const allCategories = useMemo(() => {
    const defaultCategories: CategoryOption[] = EXPENSE_CATEGORIES.map(cat => ({
      value: cat,
      label: cat,
      color: getCategoryColor(cat),
      isCustom: false
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
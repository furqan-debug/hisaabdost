
import { useState } from "react";

export function useExpenseSelection() {
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  const toggleSelectAll = (allExpenseIds: string[]) => {
    if (selectedExpenses.size === allExpenseIds.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(allExpenseIds));
    }
  };

  const toggleExpenseSelection = (expenseId: string) => {
    const newSelection = new Set(selectedExpenses);
    if (newSelection.has(expenseId)) {
      newSelection.delete(expenseId);
    } else {
      newSelection.add(expenseId);
    }
    setSelectedExpenses(newSelection);
  };

  const clearSelection = () => {
    setSelectedExpenses(new Set());
  };

  return {
    selectedExpenses,
    toggleSelectAll,
    toggleExpenseSelection,
    clearSelection
  };
}

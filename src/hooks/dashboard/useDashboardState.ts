
import { useState } from "react";
import { Expense } from "@/components/expenses/types";

export function useDashboardState() {
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);

  return {
    expenseToEdit,
    setExpenseToEdit,
    chartType,
    setChartType,
    showAddExpense,
    setShowAddExpense
  };
}

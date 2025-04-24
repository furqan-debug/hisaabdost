
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface ComparisonData {
  category: string;
  currentAmount: number;
  lastAmount: number;
  percentageChange: number;
  ratio: number;
  color: string;
}

export function useExpensesComparison(expenses: Expense[], categoryColors: Record<string, string>) {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(lastMonthStart);

  const currentMonthExpenses = expenses.filter(
    expense => new Date(expense.date) >= currentMonthStart
  );

  const lastMonthExpenses = expenses.filter(
    expense => {
      const date = new Date(expense.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }
  );

  const getCategoryTotal = (expenses: Expense[], category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const categories = Object.keys(categoryColors);
  const comparisons = categories.map(category => {
    const currentAmount = getCategoryTotal(currentMonthExpenses, category);
    const lastAmount = getCategoryTotal(lastMonthExpenses, category);
    const percentageChange = lastAmount === 0
      ? (currentAmount > 0 ? 100 : 0)
      : ((currentAmount - lastAmount) / lastAmount) * 100;
      
    const ratio = lastAmount === 0 
      ? (currentAmount > 0 ? 100 : 0)
      : Math.min(200, Math.max(0, (currentAmount / lastAmount) * 100));

    return {
      category,
      currentAmount,
      lastAmount,
      percentageChange,
      ratio,
      color: categoryColors[category],
    };
  }).filter(comparison => comparison.currentAmount > 0 || comparison.lastAmount > 0)
    .sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));

  return {
    currentMonthStart,
    lastMonthStart,
    comparisons
  };
}

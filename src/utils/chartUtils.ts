
import { format } from "date-fns";
import { Expense } from "@/components/AddExpenseSheet";

export const CATEGORY_COLORS = {
  'Food': '#0088FE',
  'Rent': '#00C49F',
  'Utilities': '#FFBB28',
  'Transportation': '#FF8042',
  'Entertainment': '#8884D8',
  'Shopping': '#82CA9D',
  'Other': '#A4DE6C'
} as const;

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const processMonthlyData = (expenses: Expense[]) => {
  const expensesByMonth = expenses.reduce((acc, expense) => {
    const month = format(new Date(expense.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = {};
    }
    if (!acc[month][expense.category]) {
      acc[month][expense.category] = 0;
    }
    acc[month][expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const months = Object.keys(expensesByMonth).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return months.map(month => ({
    month,
    ...Object.keys(CATEGORY_COLORS).reduce((acc, category) => ({
      ...acc,
      [category]: expensesByMonth[month][category] || 0
    }), {})
  }));
};

export const calculatePieChartData = (expenses: Expense[]) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#A4DE6C'
  }));
};

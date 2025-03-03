
import { format } from "date-fns";
import { Expense } from "@/components/AddExpenseSheet";

export function exportExpensesToCSV(expenses: Expense[]) {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const csvContent = [
    headers.join(','),
    ...expenses.map(exp => [
      format(new Date(exp.date), 'yyyy-MM-dd'),
      `"${exp.description}"`,
      exp.category,
      exp.amount
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
}


import { useState, useMemo } from "react";
import { Expense } from "@/components/expenses/types";
import { useMonthContext } from "./use-month-context";
import { startOfMonth, endOfMonth, isWithinInterval, format } from "date-fns";

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortOrder = 'asc' | 'desc';

export function useExpenseFilter(expenses: Expense[]) {
  const { selectedMonth } = useMonthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({ field: 'date', order: 'desc' });
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: '',
    end: '',
  });

  const handleSort = (field: SortField) => {
    setSortConfig({
      field,
      order: 
        sortConfig.field === field && sortConfig.order === 'asc' 
          ? 'desc' 
          : 'asc'
    });
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        
        // Filter by the selected month
        const expenseDate = new Date(expense.date);
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);
        const isInSelectedMonth = isWithinInterval(expenseDate, {
          start: monthStart,
          end: monthEnd
        });
        
        // Use custom date range if set, otherwise use selected month
        const isInCustomDateRange = dateRange.start && dateRange.end ? 
          (expenseDate >= new Date(dateRange.start) && expenseDate <= new Date(dateRange.end)) : 
          true;
        
        const matchesTimeframe = dateRange.start && dateRange.end ? 
          isInCustomDateRange : isInSelectedMonth;
        
        return matchesSearch && matchesCategory && matchesTimeframe;
      })
      .sort((a, b) => {
        const order = sortConfig.order === 'asc' ? 1 : -1;
        
        switch (sortConfig.field) {
          case 'date':
            return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
          case 'amount':
            return (a.amount - b.amount) * order;
          case 'category':
            return a.category.localeCompare(b.category) * order;
          case 'description':
            return a.description.localeCompare(b.description) * order;
          default:
            return 0;
        }
      });
  }, [expenses, searchTerm, categoryFilter, dateRange, sortConfig, selectedMonth]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Automatically clear custom date range when month changes
  // to default to the month-based filtering
  useMemo(() => {
    setDateRange({
      start: '',
      end: ''
    });
  }, [selectedMonth]);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortConfig,
    handleSort,
    dateRange,
    setDateRange,
    filteredExpenses,
    totalFilteredAmount,
    selectedMonth
  };
}

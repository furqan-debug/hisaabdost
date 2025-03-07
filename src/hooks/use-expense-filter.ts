
import { useState, useMemo, useEffect } from "react";
import { Expense } from "@/components/AddExpenseSheet";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortOrder = 'asc' | 'desc';

export function useExpenseFilter(expenses: Expense[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({ field: 'date', order: 'desc' });
  
  // Set default date range to current month
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
    end: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
  });

  // Update date range when selected date changes
  useEffect(() => {
    setDateRange({
      start: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
      end: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
    });
  }, [selectedDate]);

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
        const expenseDate = new Date(expense.date);
        const isInDateRange = expenseDate >= new Date(dateRange.start) && 
                             expenseDate <= new Date(dateRange.end);
        
        return matchesSearch && matchesCategory && isInDateRange;
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
  }, [expenses, searchTerm, categoryFilter, dateRange, sortConfig]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortConfig,
    handleSort,
    dateRange,
    setDateRange,
    selectedDate,
    setSelectedDate,
    filteredExpenses,
    totalFilteredAmount
  };
}

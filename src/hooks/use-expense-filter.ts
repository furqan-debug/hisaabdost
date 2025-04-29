
import { useState, useMemo, useEffect } from "react";
import { Expense } from "@/components/expenses/types";
import { useMonthContext } from "./use-month-context";
import { startOfMonth, endOfMonth, isWithinInterval, format, parseISO } from "date-fns";

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
  
  // New state to track if custom date range is active
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);

  const handleSort = (field: SortField) => {
    setSortConfig({
      field,
      order: 
        sortConfig.field === field && sortConfig.order === 'asc' 
          ? 'desc' 
          : 'asc'
    });
  };
  
  // Update useCustomDateRange whenever dateRange changes
  useEffect(() => {
    const hasCustomRange = !!(dateRange.start && dateRange.end);
    setUseCustomDateRange(hasCustomRange);
    console.log("Custom date range active:", hasCustomRange, dateRange);
  }, [dateRange]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        
        // Date filtering logic
        let matchesTimeframe = true;
        const expenseDate = new Date(expense.date);
        
        if (useCustomDateRange && dateRange.start && dateRange.end) {
          // Use custom date range if active
          const startDate = parseISO(dateRange.start);
          const endDate = parseISO(dateRange.end);
          
          // Make sure end date includes the full day
          endDate.setHours(23, 59, 59, 999);
          
          matchesTimeframe = expenseDate >= startDate && expenseDate <= endDate;
        } else {
          // Fall back to selected month
          const monthStart = startOfMonth(selectedMonth);
          const monthEnd = endOfMonth(selectedMonth);
          matchesTimeframe = isWithinInterval(expenseDate, {
            start: monthStart,
            end: monthEnd
          });
        }
        
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
  }, [expenses, searchTerm, categoryFilter, dateRange, sortConfig, selectedMonth, useCustomDateRange]);

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
    filteredExpenses,
    totalFilteredAmount,
    selectedMonth,
    useCustomDateRange
  };
}

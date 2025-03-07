
import { useState, useMemo } from "react";
import { Expense } from "@/components/AddExpenseSheet";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortOrder = 'asc' | 'desc';

export function useExpenseFilter(expenses: Expense[], selectedMonth?: Date) {
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
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
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
    let filtered = expenses;
    
    // Filter by selected month if provided
    if (selectedMonth) {
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);
      
      filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return isWithinInterval(expenseDate, { start: startDate, end: endDate });
      });
    }
    
    // Apply other filters
    return filtered
      .filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        
        // Only apply date range filter if no selectedMonth is provided
        if (selectedMonth) {
          return matchesSearch && matchesCategory;
        }
        
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
  }, [expenses, searchTerm, categoryFilter, dateRange, sortConfig, selectedMonth]);

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
    totalFilteredAmount
  };
}

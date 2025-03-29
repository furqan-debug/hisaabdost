
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Expense } from "@/components/expenses/types";
import { useExpenseFilter } from "@/hooks/use-expense-filter";
import { useExpenseSelection } from "@/hooks/use-expense-selection";
import { useExpenseDelete } from "@/components/expenses/useExpenseDelete";
import { ExpenseHeader } from "@/components/expenses/ExpenseHeader";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { exportExpensesToCSV } from "@/utils/exportUtils";
import { useMonthContext } from "@/hooks/use-month-context";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Expenses = () => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const { deleteExpense, deleteMultipleExpenses } = useExpenseDelete();
  const { selectedMonth, isLoading: isMonthDataLoading } = useMonthContext();
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Fetch expenses from Supabase using React Query, filtered by selected month
  const { data: expenses = [], isLoading: isExpensesLoading, refetch } = useQuery({
    queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching expenses for user:", user.id, "and month:", format(selectedMonth, 'yyyy-MM'));
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        toast.error("Failed to load expenses. Please try again.");
        return [];
      }
      
      console.log("Fetched expenses:", data);
      
      return data.map(exp => ({
        id: exp.id,
        amount: Number(exp.amount),
        description: exp.description,
        date: exp.date,
        category: exp.category,
        paymentMethod: exp.payment || undefined,
        notes: exp.notes || undefined,
        isRecurring: exp.is_recurring || false,
        receiptUrl: exp.receipt_url || undefined,
      }));
    },
    enabled: !!user,
    // Refetch every 5 seconds and when component is mounted
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data stale immediately
  });

  // Hook for filtering and sorting expenses
  const {
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
  } = useExpenseFilter(expenses);

  // Hook for managing expense selection
  const {
    selectedExpenses,
    toggleSelectAll,
    toggleExpenseSelection,
    clearSelection
  } = useExpenseSelection();

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedExpenses.size === 0) return;
    
    const success = await deleteMultipleExpenses(Array.from(selectedExpenses));
    if (success) {
      clearSelection();
    }
  };

  const handleSingleDelete = async (id: string) => {
    await deleteExpense(id);
    if (selectedExpenses.has(id)) {
      toggleExpenseSelection(id);
    }
  };

  const exportToCSV = () => {
    exportExpensesToCSV(filteredExpenses);
  };

  // Listen for receipt scan event to trigger a refetch
  useEffect(() => {
    const handleReceiptScan = () => {
      console.log("Receipt scan detected, refreshing expenses list");
      refetch();
    };
    
    const handleExpensesUpdated = () => {
      console.log("Expenses updated event detected, refreshing list");
      refetch();
    };
    
    window.addEventListener('receipt-scanned', handleReceiptScan);
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    
    // Initial refetch when component mounts
    refetch();
    
    return () => {
      window.removeEventListener('receipt-scanned', handleReceiptScan);
      window.removeEventListener('expenses-updated', handleExpensesUpdated);
    };
  }, [refetch]);

  const isLoading = isMonthDataLoading || isExpensesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ExpenseHeader 
        selectedExpenses={selectedExpenses}
        onDeleteSelected={handleDeleteSelected}
        onAddExpense={handleAddExpense}
        expenseToEdit={expenseToEdit}
        onExpenseEditClose={() => setExpenseToEdit(undefined)}
        showAddExpense={showAddExpense}
        setShowAddExpense={setShowAddExpense}
        exportToCSV={exportToCSV}
      />

      <ExpenseList
        filteredExpenses={filteredExpenses}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        sortConfig={sortConfig}
        handleSort={handleSort}
        selectedExpenses={selectedExpenses}
        toggleSelectAll={() => toggleSelectAll(filteredExpenses.map(exp => exp.id))}
        toggleExpenseSelection={toggleExpenseSelection}
        onAddExpense={handleAddExpense}
        onEdit={(expense) => {
          setExpenseToEdit(expense);
          setShowAddExpense(true);
        }}
        onDelete={handleSingleDelete}
        totalFilteredAmount={totalFilteredAmount}
      />
    </div>
  );
};

export default Expenses;

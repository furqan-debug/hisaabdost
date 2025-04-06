import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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
import { useExpenseRefresh } from "@/hooks/useExpenseRefresh";

const Expenses = () => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const { deleteExpense, deleteMultipleExpenses } = useExpenseDelete();
  const { selectedMonth, isLoading: isMonthDataLoading } = useMonthContext();
  const { refreshTrigger, triggerRefresh } = useExpenseRefresh();
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Define month boundaries for filtering
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const formattedMonthStart = format(monthStart, 'yyyy-MM-dd');
  const formattedMonthEnd = format(monthEnd, 'yyyy-MM-dd');

  // Fetch expenses using React Query, now filtering by the selected month
  const { data: expenses = [], isLoading: isExpensesLoading, refetch } = useQuery({
    queryKey: ['expenses', format(selectedMonth, 'yyyy-MM'), refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log(`Fetching expenses for month: ${format(selectedMonth, 'MMMM yyyy')}`);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', formattedMonthStart)
        .lte('date', formattedMonthEnd)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        toast.error("Failed to load expenses. Please try again.");
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} expenses for ${format(selectedMonth, 'MMMM yyyy')}`);
      
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
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Hook for filtering and sorting expenses - now will handle date filtering
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
    totalFilteredAmount,
    useCustomDateRange
  } = useExpenseFilter(expenses);

  // Hook for managing expense selection
  const {
    selectedExpenses,
    toggleSelectAll,
    toggleExpenseSelection,
    clearSelection
  } = useExpenseSelection();

  // Update date range when selectedMonth changes
  useEffect(() => {
    setDateRange({
      start: formattedMonthStart,
      end: formattedMonthEnd
    });
  }, [selectedMonth, formattedMonthStart, formattedMonthEnd]);

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleExpenseAdded = () => {
    // Refresh expenses when a new expense is added
    refetch();
    // Force a refresh after a delay to ensure DB has been updated
    setTimeout(() => {
      refetch();
      triggerRefresh();
    }, 1000);
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
      // Force a refresh after a delay to ensure DB has been updated
      setTimeout(() => {
        refetch();
        triggerRefresh();
      }, 1000);
    };
    
    const handleExpensesUpdated = () => {
      console.log("Expenses updated event detected, refreshing list");
      refetch();
      // Force a refresh after a delay to ensure DB has been updated
      setTimeout(() => {
        refetch();
        triggerRefresh();
      }, 1000);
    };
    
    window.addEventListener('receipt-scanned', handleReceiptScan);
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    
    // Initial refetch when component mounts
    refetch();
    
    return () => {
      window.removeEventListener('receipt-scanned', handleReceiptScan);
      window.removeEventListener('expenses-updated', handleExpensesUpdated);
    };
  }, [refetch, triggerRefresh]);

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
        onAddExpense={handleExpenseAdded}
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
        selectedMonth={selectedMonth}
        useCustomDateRange={useCustomDateRange}
      />
    </div>
  );
};

export default Expenses;

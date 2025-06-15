import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Expense } from "@/components/expenses/types";
import { useExpenseFilter } from "@/hooks/use-expense-filter";
import { useExpenseSelection } from "@/hooks/use-expense-selection";
import { useExpenseDelete } from "@/components/expenses/useExpenseDelete";
import { ExpenseHeader } from "@/components/expenses/ExpenseHeader";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { exportExpensesToCSV, exportExpensesToPDF } from "@/utils/exportUtils";
import { useMonthContext } from "@/hooks/use-month-context";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useExpenseRefresh } from "@/hooks/useExpenseRefresh";

const Expenses = () => {
  const { user } = useAuth();
  const { deleteExpense, deleteMultipleExpenses } = useExpenseDelete();
  const { selectedMonth, isLoading: isMonthDataLoading } = useMonthContext();
  const { refreshTrigger, triggerRefresh } = useExpenseRefresh();
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [showAddExpense, setShowAddExpense] = useState(false);

  const { data: allExpenses = [], isLoading: isExpensesLoading, refetch } = useQuery({
    queryKey: ['all-expenses', refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching all expenses for user:", user.id);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        toast.error("Failed to load expenses. Please try again.");
        return [];
      }
      
      console.log("Fetched expenses:", data?.length || 0, "items");
      
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
    staleTime: 1000, // Consider data stale after 1 second
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

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
  } = useExpenseFilter(allExpenses);

  const {
    selectedExpenses,
    toggleSelectAll,
    toggleExpenseSelection,
    clearSelection
  } = useExpenseSelection();

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleExpenseAdded = () => {
    console.log("Expense added, triggering refresh");
    refetch();
    triggerRefresh();
    // Add a second refetch with delay to catch any pending database operations
    setTimeout(() => {
      refetch();
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

  const exportToCSV = async () => {
    try {
      await exportExpensesToCSV(filteredExpenses);
    } catch (error) {
      console.error('Export CSV failed:', error);
    }
  };

  const exportToPDF = async () => {
    try {
      await exportExpensesToPDF(filteredExpenses);
    } catch (error) {
      console.error('Export PDF failed:', error);
    }
  };

  // Listen for receipt scanning and expense update events with enhanced logging
  useEffect(() => {
    const handleReceiptScan = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("Receipt scan detected in Expenses page, refreshing list", customEvent.detail);
      refetch();
      triggerRefresh();
      // Additional delayed refresh for receipt scans
      setTimeout(() => {
        console.log("Delayed refresh after receipt scan");
        refetch();
      }, 1500);
    };
    
    const handleExpensesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("Expenses updated event detected in Expenses page", customEvent.detail);
      refetch();
      triggerRefresh();
    };
    
    console.log("Setting up event listeners in Expenses page");
    window.addEventListener('receipt-scanned', handleReceiptScan);
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    window.addEventListener('expense-added', handleExpensesUpdated);
    
    return () => {
      console.log("Cleaning up event listeners in Expenses page");
      window.removeEventListener('receipt-scanned', handleReceiptScan);
      window.removeEventListener('expenses-updated', handleExpensesUpdated);
      window.removeEventListener('expense-added', handleExpensesUpdated);
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
        exportToPDF={exportToPDF}
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

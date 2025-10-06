
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/expenses/types";
import { useExpenseFilter } from "@/hooks/use-expense-filter";
import { useExpenseSelection } from "@/hooks/use-expense-selection";
import { useExpenseDelete } from "@/components/expenses/useExpenseDelete";
import { ExpenseHeader } from "@/components/expenses/ExpenseHeader";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { exportExpensesToCSV, exportExpensesToPDF } from "@/utils/exportUtils";
import { useMonthContext } from "@/hooks/use-month-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenseQueries } from "@/hooks/useExpenseQueries";
import { useFinnyDataSync } from "@/hooks/useFinnyDataSync";

const Expenses = () => {
  const queryClient = useQueryClient();
  const { deleteExpense, deleteMultipleExpenses } = useExpenseDelete();
  const { selectedMonth, isLoading: isMonthDataLoading } = useMonthContext();
  const { expenses, isLoading: isExpensesLoading, refetch } = useExpenseQueries();
  
  // Enable comprehensive data synchronization
  useFinnyDataSync();
  
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Listen for expense-related events and invalidate cache
  useEffect(() => {
    const handleExpensesUpdated = async () => {
      console.log('Expenses updated event received - invalidating and refetching...');
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      refetch();
    };

    window.addEventListener('expenses-updated', handleExpensesUpdated);
    window.addEventListener('expense-added', handleExpensesUpdated);
    window.addEventListener('expense-deleted', handleExpensesUpdated);
    
    return () => {
      window.removeEventListener('expenses-updated', handleExpensesUpdated);
      window.removeEventListener('expense-added', handleExpensesUpdated);
      window.removeEventListener('expense-deleted', handleExpensesUpdated);
    };
  }, [refetch, queryClient]);


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
  } = useExpenseFilter(expenses || []);

  const {
    selectedExpenses,
    toggleSelectAll,
    toggleExpenseSelection,
    clearSelection
  } = useExpenseSelection();

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  // Simple expense added handler - cache updates handled automatically
  const handleExpenseAdded = () => {
    console.log("Expense added - cache updated automatically");
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
    <div className="space-y-5 px-3 md:px-6 pt-4 pb-24 md:pb-8">
        <ExpenseHeader 
          selectedExpenses={selectedExpenses}
          onDeleteSelected={handleDeleteSelected}
          onAddExpense={handleExpenseAdded}
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
          onDelete={handleSingleDelete}
          totalFilteredAmount={totalFilteredAmount}
          selectedMonth={selectedMonth}
          useCustomDateRange={useCustomDateRange}
        />
    </div>
  );
};

export default Expenses;

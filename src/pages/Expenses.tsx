
import { useState } from "react";
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

const Expenses = () => {
  const { deleteExpense, deleteMultipleExpenses } = useExpenseDelete();
  const { selectedMonth, isLoading: isMonthDataLoading } = useMonthContext();
  const { expenses, isLoading: isExpensesLoading } = useExpenseQueries();
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [showAddExpense, setShowAddExpense] = useState(false);

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

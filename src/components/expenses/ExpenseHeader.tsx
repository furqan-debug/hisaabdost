
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { Expense } from "@/components/expenses/types";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpenseHeaderProps {
  selectedExpenses: Set<string>;
  onDeleteSelected: () => void;
  onAddExpense: () => void;
  expenseToEdit?: Expense;
  onExpenseEditClose: () => void;
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  exportToCSV: () => void;
}

export function ExpenseHeader({
  selectedExpenses,
  onDeleteSelected,
  onAddExpense,
  expenseToEdit,
  onExpenseEditClose,
  showAddExpense,
  setShowAddExpense,
  exportToCSV
}: ExpenseHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold gradient-text">Expenses</h1>
        <p className="text-sm text-muted-foreground">
          Manage and analyze your expenses
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <AddExpenseSheet 
          onAddExpense={() => {}} // This is now handled internally in the component
          expenseToEdit={expenseToEdit}
          onClose={onExpenseEditClose}
          open={showAddExpense || expenseToEdit !== undefined}
          onOpenChange={setShowAddExpense}
        />
        
        {isMobile ? (
          <>
            {selectedExpenses.size > 0 && (
              <Button 
                variant="destructive"
                onClick={onDeleteSelected}
                size="sm"
                className="whitespace-nowrap active-scale focus-ring"
              >
                Delete ({selectedExpenses.size})
              </Button>
            )}
            
            <Button
              variant="outline"
              size="icon-sm"
              onClick={exportToCSV}
              className="frosted-card active-scale focus-ring"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Export</span>
            </Button>
            
            {/* Floating action button for mobile - rendered outside this header */}
          </>
        ) : (
          <>
            {selectedExpenses.size > 0 && (
              <Button 
                variant="destructive"
                onClick={onDeleteSelected}
                className="whitespace-nowrap active-scale focus-ring"
              >
                Delete Selected ({selectedExpenses.size})
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="frosted-card active-scale focus-ring"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              onClick={() => setShowAddExpense(true)}
              className="shadow-md hover:shadow-lg transition-all duration-200 active-scale focus-ring"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </>
        )}
      </div>
      
      {/* Floating Action Button for mobile */}
      {isMobile && (
        <div className="floating-action-button" onClick={() => setShowAddExpense(true)}>
          <Plus className="h-6 w-6" />
        </div>
      )}
    </header>
  );
}

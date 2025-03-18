
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { Expense } from "@/components/expenses/types";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
    <header className={cn(
      "space-y-3 mb-4",
      isMobile ? "px-1" : "flex justify-between items-center space-y-0"
    )}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Expenses
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage and analyze your expenses
        </p>
      </div>
      
      <div className={cn(
        "flex items-center gap-2",
        isMobile ? "justify-between w-full" : "w-auto justify-end"
      )}>
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
                className="whitespace-nowrap rounded-lg"
              >
                Delete ({selectedExpenses.size})
              </Button>
            )}
            
            <Button
              variant="outline"
              size="icon-sm"
              onClick={exportToCSV}
              className="rounded-lg"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Export</span>
            </Button>
          </>
        ) : (
          <>
            {selectedExpenses.size > 0 && (
              <Button 
                variant="destructive"
                onClick={onDeleteSelected}
                className="whitespace-nowrap rounded-lg"
              >
                Delete Selected ({selectedExpenses.size})
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="rounded-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              onClick={() => setShowAddExpense(true)}
              className="rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </>
        )}
      </div>
      
      {/* Floating Action Button for mobile */}
      {isMobile && (
        <div 
          className="floating-action-button"
          onClick={() => setShowAddExpense(true)}
        >
          <Plus className="h-6 w-6" />
        </div>
      )}
    </header>
  );
}

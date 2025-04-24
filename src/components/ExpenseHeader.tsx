
import { Button } from "@/components/ui/button";
import { Download, FileText, FilePdf, Plus } from "lucide-react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportExpensesToCSV, exportExpensesToPDF } from "@/utils/exportUtils";

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
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: 'csv' | 'pdf') => {
    setIsExporting(type);
    try {
      if (type === 'csv') {
        exportToCSV();
      }
      // We don't need to handle PDF export here as it's passed directly to the dropdown item
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
    }
  };

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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => handleExport('csv')}
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => exportExpensesToPDF([])} // This will be updated in Expenses.tsx
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FilePdf className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => handleExport('csv')}
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'csv' ? 'Exporting...' : 'CSV'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => exportExpensesToPDF([])} // This will be updated in Expenses.tsx
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FilePdf className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
      
      <AddExpenseSheet 
        onAddExpense={onAddExpense}
        expenseToEdit={expenseToEdit}
        onClose={onExpenseEditClose}
        open={showAddExpense || expenseToEdit !== undefined}
        onOpenChange={setShowAddExpense}
      />
    </header>
  );
}

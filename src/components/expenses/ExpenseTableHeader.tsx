
import { ArrowDown, ArrowUp } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Expense } from "@/components/expenses/types";

interface ExpenseTableHeaderProps {
  sortConfig: { field: 'date' | 'amount' | 'category' | 'description'; order: 'asc' | 'desc' };
  handleSort: (field: 'date' | 'amount' | 'category' | 'description') => void;
  selectedExpenses: Set<string>;
  filteredExpenses: Expense[];
  toggleSelectAll: () => void;
}

export function ExpenseTableHeader({
  sortConfig,
  handleSort,
  selectedExpenses,
  filteredExpenses,
  toggleSelectAll
}: ExpenseTableHeaderProps) {
  const sortIndicator = (field: 'date' | 'amount' | 'category' | 'description') => {
    if (sortConfig.field === field) {
      return sortConfig.order === 'asc' ? (
        <ArrowUp className="ml-1 h-3 w-3" />
      ) : (
        <ArrowDown className="ml-1 h-3 w-3" />
      );
    }
    return null;
  };

  const allSelected = filteredExpenses.length > 0 && 
    filteredExpenses.every(expense => selectedExpenses.has(expense.id));
  
  const someSelected = selectedExpenses.size > 0 && !allSelected;

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[30px]">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={toggleSelectAll}
          />
        </TableHead>
        <TableHead>
          <Button
            variant="ghost"
            className="p-0 font-medium flex items-center"
            onClick={() => handleSort('date')}
          >
            Date {sortIndicator('date')}
          </Button>
        </TableHead>
        <TableHead>
          <Button
            variant="ghost"
            className="p-0 font-medium flex items-center"
            onClick={() => handleSort('description')}
          >
            Name {sortIndicator('description')}
          </Button>
        </TableHead>
        <TableHead>
          <Button
            variant="ghost"
            className="p-0 font-medium flex items-center"
            onClick={() => handleSort('amount')}
          >
            Amount {sortIndicator('amount')}
          </Button>
        </TableHead>
        <TableHead className="hidden md:table-cell">
          <Button
            variant="ghost"
            className="p-0 font-medium flex items-center"
            onClick={() => handleSort('category')}
          >
            Category {sortIndicator('category')}
          </Button>
        </TableHead>
        <TableHead className="hidden lg:table-cell">Payment</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

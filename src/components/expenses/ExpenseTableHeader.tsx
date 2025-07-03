
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Expense } from "@/components/expenses/types";

interface ExpenseTableHeaderProps {
  sortConfig: {
    field: 'date' | 'amount' | 'category' | 'description';
    order: 'asc' | 'desc';
  };
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
  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.order === 'asc' ? 
      <ChevronUp className="ml-2 h-4 w-4" /> : 
      <ChevronDown className="ml-2 h-4 w-4" />;
  };

  // Determine if all expenses are selected
  const allSelected = filteredExpenses.length > 0 && selectedExpenses.size === filteredExpenses.length;
  const someSelected = selectedExpenses.size > 0 && selectedExpenses.size < filteredExpenses.length;

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[30px]">
          <Checkbox 
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all expenses"
          />
        </TableHead>
        <TableHead>
          <Button
            variant="ghost"
            onClick={() => handleSort('date')}
            className="h-auto p-0 font-medium"
          >
            Date
            {getSortIcon('date')}
          </Button>
        </TableHead>
        <TableHead>
          <Button
            variant="ghost"
            onClick={() => handleSort('description')}
            className="h-auto p-0 font-medium"
          >
            Description
            {getSortIcon('description')}
          </Button>
        </TableHead>
        <TableHead>
          <Button
            variant="ghost"
            onClick={() => handleSort('amount')}
            className="h-auto p-0 font-medium"
          >
            Amount
            {getSortIcon('amount')}
          </Button>
        </TableHead>
        <TableHead className="hidden md:table-cell">
          <Button
            variant="ghost"
            onClick={() => handleSort('category')}
            className="h-auto p-0 font-medium"
          >
            Category
            {getSortIcon('category')}
          </Button>
        </TableHead>
        <TableHead className="hidden lg:table-cell">Payment</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

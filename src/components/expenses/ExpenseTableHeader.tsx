
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpIcon, CheckSquare, Square } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortOrder = 'asc' | 'desc';

interface ExpenseTableHeaderProps {
  sortConfig: {
    field: SortField;
    order: SortOrder;
  };
  handleSort: (field: SortField) => void;
  selectedExpenses: Set<string>;
  filteredExpenses: any[];
  toggleSelectAll: () => void;
}

export function ExpenseTableHeader({
  sortConfig,
  handleSort,
  selectedExpenses,
  filteredExpenses,
  toggleSelectAll,
}: ExpenseTableHeaderProps) {
  const isMobile = useIsMobile();
  
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.order === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
      <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };

  if (isMobile) {
    return (
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px] p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSelectAll}
              className="h-8 w-8 p-0"
            >
              {selectedExpenses.size === filteredExpenses.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </Button>
          </TableHead>
          <TableHead className="p-2">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort('description')}
                className="h-8 text-xs"
              >
                Details {getSortIcon('description')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort('date')}
                className="h-8 text-xs"
              >
                Date {getSortIcon('date')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort('amount')}
                className="h-8 text-xs"
              >
                $ {getSortIcon('amount')}
              </Button>
            </div>
          </TableHead>
          <TableHead className="w-[40px] p-2"></TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSelectAll}
            className="h-8 w-8 p-0"
          >
            {selectedExpenses.size === filteredExpenses.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => handleSort('date')}
            className="flex items-center"
          >
            Date {getSortIcon('date')}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => handleSort('description')}
            className="flex items-center"
          >
            Description {getSortIcon('description')}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => handleSort('category')}
            className="flex items-center"
          >
            Category {getSortIcon('category')}
          </Button>
        </TableHead>
        <TableHead>Payment</TableHead>
        <TableHead className="text-right">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('amount')}
            className="flex items-center justify-end w-full"
          >
            Amount {getSortIcon('amount')}
          </Button>
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

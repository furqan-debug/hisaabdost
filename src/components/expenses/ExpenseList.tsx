
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseTableHeader } from "@/components/expenses/ExpenseTableHeader";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { Expense } from "@/components/expenses/types";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CurrencyCode } from "@/utils/currencyUtils";

interface ExpenseListProps {
  filteredExpenses: Expense[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  dateRange: {
    start: string;
    end: string;
  };
  setDateRange: (dateRange: {
    start: string;
    end: string;
  }) => void;
  sortConfig: {
    field: 'date' | 'amount' | 'category' | 'description';
    order: 'asc' | 'desc';
  };
  handleSort: (field: 'date' | 'amount' | 'category' | 'description') => void;
  selectedExpenses: Set<string>;
  toggleSelectAll: () => void;
  toggleExpenseSelection: (id: string) => void;
  onAddExpense: () => void;
  onDelete: (id: string) => void;
  totalFilteredAmount: number;
  selectedMonth: Date;
  useCustomDateRange: boolean;
}

interface MobileExpenseRowProps {
  expense: Expense;
  selected: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  currencyCode: CurrencyCode;
}

const MobileExpenseRow = ({ expense, selected, onToggle, onDelete, currencyCode }: MobileExpenseRowProps) => {
  return (
    <div className="bg-card p-3 rounded-lg border border-border/40 mb-3 shadow-sm flex items-center gap-3 transition-colors hover:bg-muted/50">
      <Checkbox
        checked={selected}
        onCheckedChange={onToggle}
        aria-label="Select expense"
        className="h-5 w-5"
      />
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex-grow overflow-hidden mr-2">
            <p className="font-medium truncate">{expense.description}</p>
            <p className="text-xs text-muted-foreground">{expense.category}</p>
          </div>
          <p className="font-semibold text-base whitespace-nowrap">{formatCurrency(expense.amount, currencyCode)}</p>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">{format(new Date(expense.date), "MMM dd, yyyy")}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export function ExpenseList({
  filteredExpenses,
  isLoading,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  dateRange,
  setDateRange,
  sortConfig,
  handleSort,
  selectedExpenses,
  toggleSelectAll,
  toggleExpenseSelection,
  onAddExpense,
  onDelete,
  totalFilteredAmount,
  selectedMonth,
  useCustomDateRange
}: ExpenseListProps) {
  const { currencyCode } = useCurrency();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Expense List</CardTitle>
            <p className="text-sm font-medium">
              Total: {formatCurrency(totalFilteredAmount, currencyCode)}
            </p>
          </div>
          {selectedExpenses.size > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedExpenses.size === filteredExpenses.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedExpenses.size} selected
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="px-2">
          <div className="space-y-4">
            <ExpenseFilters 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              categoryFilter={categoryFilter} 
              setCategoryFilter={setCategoryFilter} 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
              selectedMonth={selectedMonth} 
              useCustomDateRange={useCustomDateRange} 
            />
            <div className="no-scrollbar touch-scroll-container">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading expenses...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">No expenses found</p>
                    <Button variant="teal" onClick={onAddExpense} className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add expense
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {filteredExpenses.map(expense => (
                    <MobileExpenseRow
                      key={expense.id}
                      expense={expense}
                      selected={selectedExpenses.has(expense.id)}
                      onToggle={() => toggleExpenseSelection(expense.id)}
                      onDelete={onDelete}
                      currencyCode={currencyCode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Expense List</CardTitle>
          <p className="text-sm font-medium">
            Total: {formatCurrency(totalFilteredAmount, currencyCode)}
          </p>
        </div>
        {selectedExpenses.size > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedExpenses.size === filteredExpenses.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedExpenses.size} selected
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-[4px]">
        <div className="space-y-4">
          <ExpenseFilters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            categoryFilter={categoryFilter} 
            setCategoryFilter={setCategoryFilter} 
            dateRange={dateRange} 
            setDateRange={setDateRange} 
            selectedMonth={selectedMonth} 
            useCustomDateRange={useCustomDateRange} 
          />

          <div className="rounded-lg border border-border/40 overflow-hidden no-scrollbar touch-scroll-container">
            <Table>
              <ExpenseTableHeader 
                sortConfig={sortConfig} 
                handleSort={handleSort} 
                selectedExpenses={selectedExpenses} 
                filteredExpenses={filteredExpenses} 
                toggleSelectAll={toggleSelectAll} 
              />
              <TableBody className="no-scrollbar">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">Loading expenses...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">No expenses found</p>
                        <Button variant="teal" onClick={onAddExpense} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add expense
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => (
                    <ExpenseRow 
                      key={expense.id} 
                      expense={expense} 
                      selectedExpenses={selectedExpenses} 
                      toggleExpenseSelection={toggleExpenseSelection} 
                      onDelete={onDelete} 
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseTableHeader } from "@/components/expenses/ExpenseTableHeader";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { Expense } from "@/components/expenses/types";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
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
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  totalFilteredAmount: number;
  selectedMonth: Date;
  useCustomDateRange: boolean;
}
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
  onEdit,
  onDelete,
  totalFilteredAmount,
  selectedMonth,
  useCustomDateRange
}: ExpenseListProps) {
  const {
    currencyCode
  } = useCurrency();
  return <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Expense List</CardTitle>
          <p className="text-sm font-medium">
            Total: {formatCurrency(totalFilteredAmount, currencyCode)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-[4px]">
        <div className="space-y-4">
          <ExpenseFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} dateRange={dateRange} setDateRange={setDateRange} selectedMonth={selectedMonth} useCustomDateRange={useCustomDateRange} />

          <div className="rounded-lg border border-border/40 overflow-hidden no-scrollbar touch-scroll-container">
            <Table>
              <ExpenseTableHeader sortConfig={sortConfig} handleSort={handleSort} selectedExpenses={selectedExpenses} filteredExpenses={filteredExpenses} toggleSelectAll={toggleSelectAll} />
              <TableBody className="no-scrollbar">
                {isLoading ? <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">Loading expenses...</p>
                      </div>
                    </td>
                  </tr> : filteredExpenses.length === 0 ? <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">No expenses found</p>
                        <Button variant="teal" onClick={onAddExpense} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add expense
                        </Button>
                      </div>
                    </td>
                  </tr> : filteredExpenses.map(expense => <ExpenseRow key={expense.id} expense={expense} selectedExpenses={selectedExpenses} toggleExpenseSelection={toggleExpenseSelection} onEdit={onEdit} onDelete={onDelete} />)}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>;
}
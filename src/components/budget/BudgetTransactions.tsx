import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";

// Mock data - replace with actual transaction data from your backend
const mockTransactions = [
  {
    id: "1",
    date: new Date(),
    category: "Food",
    description: "Grocery shopping",
    amount: 150.50,
  },
  {
    id: "2",
    date: new Date(),
    category: "Transportation",
    description: "Gas",
    amount: 45.00,
  },
  // Add more mock transactions as needed
];

export function BudgetTransactions() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(transaction.date, 'MMM dd, yyyy')}</TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

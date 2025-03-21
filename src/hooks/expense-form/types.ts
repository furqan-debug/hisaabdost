
import { Expense } from "@/components/expenses/types";

export interface ExpenseFormData {
  amount: string;
  description: string;
  date: string;
  category: string;
  paymentMethod: string;
  notes: string;
  isRecurring: boolean;
  receiptFile: File | null;
  receiptUrl: string;
}

export interface UseExpenseFormProps {
  expenseToEdit?: Expense;
  onClose?: () => void;
}

export interface ScanResult {
  storeName?: string;
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod: string;
}

export interface ReceiptItem {
  name: string;
  amount: string;
  category?: string;
}

export interface ReceiptScanResult {
  storeName: string;
  date: string;
  items: ReceiptItem[];
  total: string;
  paymentMethod: string;
}

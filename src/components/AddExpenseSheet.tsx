
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  receiptUrl?: string;
}

const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Other"
];

const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "PayPal",
  "Mobile Wallet",
  "Other"
];

interface AddExpenseSheetProps {
  onAddExpense: (expense: Expense) => void;
  expenseToEdit?: Expense;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddExpenseSheet = ({ 
  onAddExpense, 
  expenseToEdit, 
  onClose,
  open,
  onOpenChange 
}: AddExpenseSheetProps) => {
  const [amount, setAmount] = useState<string>(expenseToEdit?.amount.toString() || "");
  const [description, setDescription] = useState<string>(expenseToEdit?.description || "");
  const [date, setDate] = useState<string>(expenseToEdit?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(expenseToEdit?.category || "Other");
  const [paymentMethod, setPaymentMethod] = useState<string>(expenseToEdit?.paymentMethod || "Cash");
  const [notes, setNotes] = useState<string>(expenseToEdit?.notes || "");
  const [isRecurring, setIsRecurring] = useState<boolean>(expenseToEdit?.isRecurring || false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>(expenseToEdit?.receiptUrl || "");

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description);
      setDate(expenseToEdit.date);
      setCategory(expenseToEdit.category);
      setPaymentMethod(expenseToEdit.paymentMethod || "Cash");
      setNotes(expenseToEdit.notes || "");
      setIsRecurring(expenseToEdit.isRecurring || false);
      setReceiptUrl(expenseToEdit.receiptUrl || "");
    }
  }, [expenseToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date || !category) return;

    onAddExpense({
      id: expenseToEdit?.id || crypto.randomUUID(),
      amount: parseFloat(amount),
      description,
      date,
      category,
      paymentMethod,
      notes,
      isRecurring,
      receiptUrl,
    });

    // Reset form
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategory("Other");
    setPaymentMethod("Cash");
    setNotes("");
    setIsRecurring(false);
    setReceiptFile(null);
    setReceiptUrl("");
    onClose?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        alert('Please upload an image or PDF file');
        return;
      }

      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setReceiptUrl(url);

      if (receiptUrl && receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(receiptUrl);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (receiptUrl && receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(receiptUrl);
      }
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {expenseToEdit ? "Edit Expense" : "Add Expense"}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</SheetTitle>
          <SheetDescription>
            {expenseToEdit ? "Edit your expense details below." : "Add your expense details here. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="expense-description">Expense Name</Label>
            <Input
              id="expense-description"
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expense-amount">Amount ($)</Label>
            <Input
              id="expense-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-category">Category</Label>
            <Select name="category" value={category} onValueChange={setCategory}>
              <SelectTrigger id="expense-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-payment">Payment Method</Label>
            <Select name="paymentMethod" value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="expense-payment">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-notes">Notes</Label>
            <Textarea
              id="expense-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details about the expense..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="expense-recurring"
              name="isRecurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="expense-recurring">Recurring Expense</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-receipt">Receipt</Label>
            <div className="space-y-2">
              {receiptUrl && (
                <div className="relative group">
                  {receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={receiptUrl}
                      alt="Receipt preview"
                      className="max-h-32 rounded-md border object-cover w-full"
                    />
                  ) : (
                    <div className="h-32 rounded-md border bg-muted flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Receipt document uploaded
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => document.getElementById('expense-receipt')?.click()}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  id="expense-receipt"
                  name="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('expense-receipt')?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {receiptUrl ? 'Replace Receipt' : 'Upload Receipt'}
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {expenseToEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;

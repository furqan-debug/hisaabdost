
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { DescriptionField } from "./expenses/form-fields/DescriptionField";
import { AmountField } from "./expenses/form-fields/AmountField";
import { CategoryField } from "./expenses/form-fields/CategoryField";
import { PaymentMethodField } from "./expenses/form-fields/PaymentMethodField";
import { DateField } from "./expenses/form-fields/DateField";
import { NotesField } from "./expenses/form-fields/NotesField";
import { RecurringField } from "./expenses/form-fields/RecurringField";
import { ReceiptField } from "./expenses/form-fields/ReceiptField";

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
          <DescriptionField value={description} onChange={setDescription} />
          <AmountField value={amount} onChange={setAmount} />
          <CategoryField value={category} onChange={setCategory} />
          <PaymentMethodField value={paymentMethod} onChange={setPaymentMethod} />
          <DateField value={date} onChange={setDate} />
          <NotesField value={notes} onChange={setNotes} />
          <RecurringField value={isRecurring} onChange={setIsRecurring} />
          <ReceiptField receiptUrl={receiptUrl} onFileChange={handleFileChange} />

          <Button type="submit" className="w-full">
            {expenseToEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;

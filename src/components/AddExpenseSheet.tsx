
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>(expenseToEdit?.amount.toString() || "");
  const [description, setDescription] = useState<string>(expenseToEdit?.description || "");
  const [date, setDate] = useState<string>(expenseToEdit?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(expenseToEdit?.category || "Other");
  const [paymentMethod, setPaymentMethod] = useState<string>(expenseToEdit?.paymentMethod || "Cash");
  const [notes, setNotes] = useState<string>(expenseToEdit?.notes || "");
  const [isRecurring, setIsRecurring] = useState<boolean>(expenseToEdit?.isRecurring || false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>(expenseToEdit?.receiptUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      console.log("Setting expense data from expenseToEdit:", expenseToEdit);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date || !category || !user) return;

    setIsSubmitting(true);
    try {
      const expenseData = {
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        date,
        category,
        payment: paymentMethod,
        notes,
        is_recurring: isRecurring,
        receipt_url: receiptUrl
      };

      let error;
      if (expenseToEdit) {
        const { error: updateError } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expenseToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert([expenseData]);
        error = insertError;
      }

      if (error) throw error;

      // Invalidate both expenses and budgets queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });

      uiToast({
        title: expenseToEdit ? "Expense Updated" : "Expense Added",
        description: expenseToEdit 
          ? "Your expense has been updated successfully."
          : "Your expense has been added successfully.",
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

    } catch (error) {
      console.error('Error saving expense:', error);
      uiToast({
        title: "Error",
        description: "Failed to save the expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
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

  const handleScanComplete = (expenseDetails: { 
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    console.log("Handling scan complete with details:", expenseDetails);
    
    // Update form fields with scanned data
    if (expenseDetails.description) setDescription(expenseDetails.description);
    if (expenseDetails.amount) setAmount(expenseDetails.amount);
    if (expenseDetails.date) {
      // Try to convert date to YYYY-MM-DD format
      try {
        const dateParts = expenseDetails.date.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
          let year = dateParts[2];
          // Ensure year is 4 digits
          if (year.length === 2) {
            year = `20${year}`;
          }
          // Reformat to YYYY-MM-DD
          const formattedDate = `${year}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
          setDate(formattedDate);
        }
      } catch (err) {
        console.warn("Failed to parse date from receipt", err);
        // Keep current date if parsing fails
      }
    }
    if (expenseDetails.category) setCategory(expenseDetails.category);
    if (expenseDetails.paymentMethod) setPaymentMethod(expenseDetails.paymentMethod);
    
    toast.success("Receipt data extracted and filled in! Please review before submitting.");
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
            {expenseToEdit 
              ? "Edit your expense details below." 
              : "Add your expense details here or scan a receipt. Click save when you're done."}
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
          <ReceiptField 
            receiptUrl={receiptUrl} 
            onFileChange={handleFileChange} 
            onScanComplete={handleScanComplete}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (expenseToEdit ? "Save Changes" : "Add Expense")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;


import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExpenseForm } from "./expenses/ExpenseForm";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { Expense } from "./expenses/types";

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
  const {
    formData,
    isSubmitting,
    updateField,
    handleFileChange,
    handleScanComplete,
    handleSubmit
  } = useExpenseForm({ 
    expenseToEdit, 
    onClose 
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</SheetTitle>
          <SheetDescription>
            {expenseToEdit 
              ? "Edit your expense details below." 
              : "Review and complete your expense details below. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>
        
        <ExpenseForm
          formData={formData}
          isSubmitting={isSubmitting}
          isEditing={!!expenseToEdit}
          onSubmit={handleSubmit}
          onFieldChange={updateField}
          onFileChange={handleFileChange}
          onScanComplete={handleScanComplete}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";

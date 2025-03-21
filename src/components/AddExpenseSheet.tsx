
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
import { ReceiptScanResult } from "@/hooks/expense-form/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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

  // New handler for processing multiple receipt items
  const handleItemsExtracted = async (receiptData: ReceiptScanResult) => {
    // Show toast for user feedback
    const saveToast = toast.loading(`Adding ${receiptData.items.length} items from receipt...`);
    
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        toast.error("You must be logged in to add expenses");
        return;
      }
      
      // Create a base expense object with common properties
      const baseExpense = {
        user_id: userData.user.id,
        date: receiptData.date,
        payment: receiptData.paymentMethod,
        is_recurring: false,
        receipt_url: formData.receiptUrl || null
      };
      
      let successCount = 0;
      
      // Add each item as a separate expense
      for (const item of receiptData.items) {
        // Validate the item data
        if (!item.name || parseFloat(item.amount) <= 0) {
          console.log("Skipping invalid item:", item);
          continue;
        }
        
        // Create the expense record
        const { error } = await supabase.from('expenses').insert([{
          ...baseExpense,
          description: item.name,
          amount: parseFloat(item.amount),
          category: item.category || "Groceries",
          notes: `From ${receiptData.storeName} receipt`
        }]);
        
        if (error) {
          console.error("Error adding item:", error);
        } else {
          successCount++;
        }
      }
      
      // Show success message
      toast.dismiss(saveToast);
      if (successCount > 0) {
        toast.success(`Added ${successCount} items from your receipt`);
        
        // Refresh the expenses list
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        
        // Close the sheet
        if (onClose) onClose();
        if (onOpenChange) onOpenChange(false);
      } else {
        toast.error("Failed to add any items from the receipt");
      }
    } catch (error) {
      console.error("Error processing receipt items:", error);
      toast.dismiss(saveToast);
      toast.error("An error occurred while processing receipt items");
    }
  };

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
          onItemsExtracted={handleItemsExtracted}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";

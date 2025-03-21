import React from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import AddExpenseSheet from "@/components/AddExpenseSheet";

interface AddExpenseButtonProps {
  isNewUser: boolean;
  expenseToEdit?: Expense;
  showAddExpense: boolean;
  setExpenseToEdit: (expense?: Expense) => void;
  setShowAddExpense: (show: boolean) => void;
  onAddExpense: () => void;
}

export const AddExpenseButton = ({
  isNewUser,
  expenseToEdit,
  showAddExpense,
  setExpenseToEdit,
  setShowAddExpense,
  onAddExpense,
}: AddExpenseButtonProps) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  const handleExpenseCapture = (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    if (expenseDetails) {
      console.log("Captured expense details:", expenseDetails);
      
      let formattedDate = expenseDetails.date || new Date().toISOString().split('T')[0];
      if (formattedDate && !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const date = new Date(formattedDate);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          } else {
            formattedDate = new Date().toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Could not parse date from receipt, using today's date");
          formattedDate = new Date().toISOString().split('T')[0];
        }
      }
      
      let description = expenseDetails.description?.trim() || "";
      if (description.length < 2) {
        description = "Purchase Item";
      }
      
      let amount = 0;
      try {
        amount = parseFloat(expenseDetails.amount);
        if (isNaN(amount) || amount <= 0) {
          amount = 0;
        }
      } catch {
        amount = 0;
      }
      
      let category = expenseDetails.category || "Shopping";
      const validCategories = [
        'Groceries', 'Restaurant', 'Shopping', 
        'Transportation', 'Entertainment', 'Utilities', 
        'Healthcare', 'Household', 'Education', 'Other'
      ];
      if (!validCategories.includes(category)) {
        category = "Shopping";
      }
      
      const expense: Partial<Expense> = {
        description: description,
        amount: amount,
        date: formattedDate,
        category: category,
        paymentMethod: expenseDetails.paymentMethod || "Card",
      };
      
      setExpenseToEdit(expense as Expense);
      setShowAddExpense(true);
    }
  };

  const saveExpenseToDatabase = async (expense: {
    description: string;
    amount: number;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    const saveToast = toast.loading("Adding expense to your list...");
    
    try {
      console.log("Saving expense:", expense);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        toast.error("You must be logged in to add expenses");
        toast.dismiss(saveToast);
        return false;
      }
      
      const { error } = await supabase.from('expenses').insert([{
        user_id: userData.user.id,
        description: expense.description || "Unknown Item",
        amount: expense.amount || 0,
        date: expense.date || new Date().toISOString().split('T')[0],
        category: expense.category || "Shopping",
        payment: expense.paymentMethod || "Card",
        is_recurring: false,
        notes: ""
      }]);
      
      if (error) throw error;
      
      toast.dismiss(saveToast);
      toast.success("Expense added successfully!");
      
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      return true;
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.dismiss(saveToast);
      toast.error("Failed to add expense. Please try again.");
      return false;
    }
  };

  const processReceiptScan = async (file: File) => {
    if (!file) return;

    const scanToast = toast.loading("Scanning and processing receipt...");
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });
      
      if (error) {
        console.error("Error scanning receipt:", error);
        toast.error("Failed to scan receipt. Please try again.");
        toast.dismiss(scanToast);
        return;
      }
      
      if (data && data.success && data.receiptData) {
        toast.success("Receipt scanned successfully!", { id: scanToast });
        
        const receiptData = data.receiptData;
        
        if (receiptData.items && receiptData.items.length > 0) {
          let validItems = receiptData.items.filter(item => {
            const amount = parseFloat(item.amount);
            return item.name && 
                  item.name.trim().length > 1 && 
                  !isNaN(amount) && 
                  amount > 0;
          });
          
          if (validItems.length === 0) {
            const success = await saveExpenseToDatabase({
              description: receiptData.storeName || "Store Purchase",
              amount: parseFloat(receiptData.total) || 0,
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
            
            toast.dismiss(scanToast);
            if (success) {
              toast.success("Expense added from receipt!");
              onAddExpense();
            }
            return;
          }
          
          toast.loading(`Adding ${validItems.length} items from receipt...`, { id: scanToast });
          
          let savedCount = 0;
          
          for (const item of validItems) {
            const description = item.name.trim();
            if (!description || description.length < 2) continue;
              
            const amount = parseFloat(item.amount);
            if (isNaN(amount) || amount <= 0) continue;
              
            const success = await saveExpenseToDatabase({
              description: description,
              amount: amount,
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: item.category || "Shopping", 
              paymentMethod: receiptData.paymentMethod || "Card"
            });
            
            if (success) savedCount++;
          }
          
          toast.dismiss(scanToast);
          if (savedCount > 0) {
            toast.success(`Added ${savedCount} items from receipt!`);
            onAddExpense();
          } else {
            toast.error("Failed to add items from receipt.");
          }
        } 
        else {
          const amount = parseFloat(receiptData.total);
          if (!isNaN(amount) && amount > 0) {
            const success = await saveExpenseToDatabase({
              description: receiptData.storeName || "Store Purchase",
              amount: amount,
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
            
            toast.dismiss(scanToast);
            if (success) {
              toast.success("Expense added from receipt!");
              onAddExpense();
            }
          } else {
            toast.dismiss(scanToast);
            toast.error("Could not determine expense amount from receipt.");
          }
        }
      } else {
        toast.error("Could not extract data from receipt.");
        toast.dismiss(scanToast);
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      toast.dismiss(scanToast);
      toast.error("Failed to process receipt. Please try again.");
    }
  };
  
  return (
    <div className="mt-6">
      <OnboardingTooltip
        content="Add an expense by uploading a receipt or entering details manually"
        defaultOpen={isNewUser}
      >
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <h3 className="text-base font-medium mb-3">Add New Expense</h3>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddExpense(true)}
              className="h-20 flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Manual Entry</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    processReceiptScan(file);
                  }
                };
                fileInput.click();
              }}
              className="h-20 flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30"
            >
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Upload Receipt</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const captureInput = document.createElement('input');
                captureInput.type = 'file';
                captureInput.accept = 'image/*';
                captureInput.capture = 'environment';
                captureInput.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    processReceiptScan(file);
                  }
                };
                captureInput.click();
              }}
              className="h-20 flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30"
            >
              <Camera className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Take Photo</span>
            </Button>
          </div>
        </div>
      </OnboardingTooltip>
      
      <AddExpenseSheet 
        onAddExpense={onAddExpense}
        expenseToEdit={expenseToEdit}
        onClose={() => {
          setExpenseToEdit(undefined);
          setShowAddExpense(false);
        }}
        open={showAddExpense || expenseToEdit !== undefined}
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
};

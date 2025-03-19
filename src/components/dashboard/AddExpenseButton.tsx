
import React from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReceiptCapture } from "@/components/expenses/form-fields/ReceiptCapture";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  
  const handleExpenseCapture = (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    // Pre-fill expense data and open the sheet
    if (expenseDetails) {
      console.log("Captured expense details:", expenseDetails);
      
      // Format the date to YYYY-MM-DD if needed
      let formattedDate = expenseDetails.date || new Date().toISOString().split('T')[0];
      
      // Process the capture date if it's not already in YYYY-MM-DD format
      if (formattedDate && !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const date = new Date(formattedDate);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Could not parse date from receipt, using today's date");
          formattedDate = new Date().toISOString().split('T')[0];
        }
      }
      
      const expense: Partial<Expense> = {
        description: expenseDetails.description || "",
        amount: parseFloat(expenseDetails.amount) || 0,
        date: formattedDate,
        // Always use "Shopping" category for OCR-scanned receipts
        category: "Shopping",
        paymentMethod: expenseDetails.paymentMethod || "Cash",
      };
      setExpenseToEdit(expense as Expense);
    }
    
    // Open the add expense sheet
    setShowAddExpense(true);
  };

  const processReceiptScan = async (file: File) => {
    if (!file) return;

    toast.loading("Scanning receipt...", { id: "scanning-receipt" });
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });
      
      if (error) {
        console.error("Error scanning receipt:", error);
        toast.error("Failed to scan receipt. Please try again.", { id: "scanning-receipt" });
        return;
      }
      
      if (data && data.success && data.receiptData) {
        toast.success("Receipt scanned successfully!", { id: "scanning-receipt" });
        handleExpenseCapture({
          description: data.receiptData.storeName || "Store purchase",
          amount: data.receiptData.total || "0.00",
          date: data.receiptData.date || new Date().toISOString().split('T')[0],
          category: "Shopping",
          paymentMethod: data.receiptData.paymentMethod || "Card",
        });
      } else {
        toast.error("Could not extract data from receipt. Please try a clearer image.", { id: "scanning-receipt" });
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      toast.error("Failed to process receipt. Please try again.", { id: "scanning-receipt" });
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
}

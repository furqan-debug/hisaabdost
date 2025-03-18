
import React from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReceiptCapture } from "@/components/expenses/form-fields/ReceiptCapture";
import { Card } from "@/components/ui/card";

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
  
  return (
    <div className="mt-6 animate-fade-in">
      <OnboardingTooltip
        content="Add an expense by uploading a receipt or entering details manually"
        defaultOpen={isNewUser}
      >
        {isMobile ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddExpense(true)}
                className="w-full frosted-card active-scale h-16 flex flex-col bg-background/50 backdrop-blur-md"
                size="lg"
              >
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-xs">Add Manually</span>
              </Button>
              
              <div className="w-full h-16">
                <ReceiptCapture 
                  onCapture={handleExpenseCapture}
                  autoSave={true}
                  buttonProps={{
                    className: "w-full h-full frosted-card active-scale bg-background/50 backdrop-blur-md flex flex-col items-center justify-center",
                    children: (
                      <>
                        <Camera className="h-5 w-5 mb-1" />
                        <span className="text-xs">Take Photo</span>
                      </>
                    )
                  }}
                />
              </div>
            </div>
            
            <Card className="p-3 text-center text-xs text-muted-foreground bg-background/30 backdrop-blur-sm border-dashed">
              Upload or take a photo of your receipt for automatic expense entry
            </Card>
            
            <Button
              onClick={() => setShowAddExpense(true)}
              className="w-full frosted-card active-scale"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => setShowAddExpense(true)}
                className="w-full frosted-card active-scale focus-ring bg-background/50 backdrop-blur-md"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
              
              <div className="w-full">
                <ReceiptCapture 
                  onCapture={handleExpenseCapture}
                  autoSave={true}
                  buttonProps={{
                    className: "w-full frosted-card active-scale h-10 bg-background/50 backdrop-blur-md",
                    size: "lg",
                    variant: "outline",
                    children: (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Receipt
                      </>
                    )
                  }}
                />
              </div>
            </div>
            
            <Card className="p-4 text-center text-sm text-muted-foreground bg-background/30 backdrop-blur-sm border-dashed">
              Upload or take a photo of your receipt for automatic expense entry
            </Card>
            
            <Button
              onClick={() => setShowAddExpense(true)}
              className="w-full frosted-card active-scale"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        )}
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

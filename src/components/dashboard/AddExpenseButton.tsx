
import React, { useState } from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  
  const handleOpenSheet = (mode: 'manual' | 'upload' | 'camera') => {
    setCaptureMode(mode);
    
    // Only open the sheet for manual mode
    // For upload and camera modes, we'll handle file selection first
    if (mode === 'manual') {
      setShowAddExpense(true);
    } else {
      // For upload and camera, we'll trigger the file input directly
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      
      // For camera on mobile, use capture attribute
      if (mode === 'camera' && isMobile) {
        fileInput.setAttribute('capture', 'environment');
      }
      
      fileInput.onchange = (e) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (file) {
          // After file selection, open sheet with auto-process mode
          setCaptureMode(mode);
          setShowAddExpense(true);
        }
      };
      
      // Trigger the file input click
      fileInput.click();
    }
  };
  
  return (
    <div className="mt-6">
      <OnboardingTooltip
        content="Add an expense in different ways"
        defaultOpen={isNewUser}
      >
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <h3 className="text-base font-medium mb-3">Add New Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleOpenSheet('manual')}
              className="h-20 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Manual Entry</span>
              <span className="text-xs text-muted-foreground">Enter details yourself</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleOpenSheet('upload')}
              className="h-20 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30"
            >
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Upload Receipt</span>
              <span className="text-xs text-muted-foreground">Auto-extract expenses</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleOpenSheet('camera')}
              className="h-20 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30"
            >
              <Camera className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Take Photo</span>
              <span className="text-xs text-muted-foreground">Scan receipt with camera</span>
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
        initialCaptureMode={captureMode}
      />
    </div>
  );
};

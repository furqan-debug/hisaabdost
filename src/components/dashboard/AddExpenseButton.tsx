import React, { useRef, useState } from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "../expenses/form-fields/receipt/ReceiptFileInput";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // For upload and camera modes, we'll set autoProcess to true
      // but we'll keep the sheet closed for manual mode
      if (captureMode === 'manual') {
        setShowAddExpense(true);
      } else {
        // For upload and camera, process automatically without showing the form
        setCaptureMode('upload');
        setShowAddExpense(true);
      }
      
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };
  
  const handleOpenSheet = (mode: 'manual' | 'upload' | 'camera') => {
    setCaptureMode(mode);
    
    // Only open the sheet for manual mode directly
    if (mode === 'manual') {
      setShowAddExpense(true);
    } else if (mode === 'upload' && fileInputRef.current) {
      // Trigger file input click for upload mode
      fileInputRef.current.click();
    } else if (mode === 'camera' && cameraInputRef.current) {
      // Trigger camera input click for camera mode
      cameraInputRef.current.click();
    }
  };
  
  // Reset state when the sheet is closed
  const handleSheetClose = () => {
    setExpenseToEdit(undefined);
    setShowAddExpense(false);
    setSelectedFile(null);
    // Reset input values to allow selecting the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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
      
      {/* Hidden file inputs */}
      <ReceiptFileInput
        onChange={handleFileChange}
        inputRef={fileInputRef}
        id="receipt-upload-button"
      />
      
      <ReceiptFileInput
        onChange={handleFileChange}
        inputRef={cameraInputRef}
        id="camera-capture-button"
        useCamera={true}
      />
      
      <AddExpenseSheet 
        onAddExpense={onAddExpense}
        expenseToEdit={expenseToEdit}
        onClose={handleSheetClose}
        open={showAddExpense || expenseToEdit !== undefined}
        onOpenChange={setShowAddExpense}
        initialCaptureMode={captureMode}
        initialFile={selectedFile}
      />
    </div>
  );
};

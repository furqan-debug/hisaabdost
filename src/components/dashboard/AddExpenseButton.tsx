
import React, { useRef, useState } from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "../expenses/form-fields/receipt/ReceiptFileInput";
import { useQueryClient } from "@tanstack/react-query";
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
  onAddExpense
}: AddExpenseButtonProps) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`File selected for auto-processing: ${file.name}`);
      setSelectedFile(file);

      // For upload or camera modes, we want to auto-process immediately
      if (captureMode === 'upload' || captureMode === 'camera') {
        console.log("Opening expense sheet in auto-process mode");
        toast.info("Processing receipt...");
        setShowAddExpense(true);
      }

      // Reset the input value
      e.target.value = '';
    }
  };

  const handleOpenSheet = (mode: 'manual' | 'upload' | 'camera') => {
    console.log(`Opening expense sheet in ${mode} mode`);
    setCaptureMode(mode);

    if (mode === 'manual') {
      // Just open the manual entry form
      setSelectedFile(null);
      setShowAddExpense(true);
    } else if (mode === 'upload' && fileInputRef.current) {
      // Trigger file upload
      fileInputRef.current.click();
    } else if (mode === 'camera' && cameraInputRef.current) {
      // Trigger camera
      cameraInputRef.current.click();
    }
  };

  const handleSheetClose = () => {
    setExpenseToEdit(undefined);
    setShowAddExpense(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };
  
  // Handle successful expense addition
  const handleSuccessfulAddExpense = (expense?: Expense) => {
    console.log("Expense(s) added successfully, refreshing data");
    // Force invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
    onAddExpense();
  };

  return <div className="mt-6">
      <OnboardingTooltip content="Add an expense in different ways" defaultOpen={isNewUser}>
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <h3 className="text-base font-medium mb-3">Add New Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => handleOpenSheet('manual')} className="h-20 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30">
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Manual Entry</span>
              <span className="text-xs text-muted-foreground my-0">Enter details yourself</span>
            </Button>
            
            <Button variant="outline" onClick={() => handleOpenSheet('upload')} className="h-20 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Upload Receipt</span>
              <span className="text-xs text-muted-foreground my-0">Auto-extract expenses</span>
            </Button>
            
            <Button variant="outline" onClick={() => handleOpenSheet('camera')} className="h-20 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-1 hover:bg-accent/30">
              <Camera className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Take Photo</span>
              <span className="text-muted-foreground my-0 mx-0 px-0 py-0 text-xs">Scan receipt with camera</span>
            </Button>
          </div>
        </div>
      </OnboardingTooltip>
      
      <ReceiptFileInput 
        onChange={handleFileChange} 
        inputRef={fileInputRef} 
        id="receipt-upload-button" 
        useCamera={false} 
      />
      
      <ReceiptFileInput 
        onChange={handleFileChange} 
        inputRef={cameraInputRef} 
        id="camera-capture-button" 
        useCamera={true} 
      />
      
      <AddExpenseSheet 
        onAddExpense={handleSuccessfulAddExpense} 
        expenseToEdit={expenseToEdit} 
        onClose={handleSheetClose} 
        open={showAddExpense || expenseToEdit !== undefined} 
        onOpenChange={setShowAddExpense} 
        initialCaptureMode={captureMode} 
        initialFile={selectedFile} 
      />
    </div>;
};

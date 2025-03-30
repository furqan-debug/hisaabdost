import React, { useRef, useState } from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "../expenses/form-fields/receipt/ReceiptFileInput";

interface AddExpenseButtonProps {
  isNew:User  boolean;
  expenseToEdit?: Expense;
  showAddExpense: boolean;
  setExpenseToEdit: (expense?: Expense) => void;
  setShowAddExpense: (show: boolean) => void;
  onAddExpense: () => void;
}

export const AddExpenseButton = ({
  isNewUser ,
  expenseToEdit,
  showAddExpense,
  setExpenseToEdit,
  setShowAddExpense,
  onAddExpense
}: AddExpenseButtonProps) => {
  const isMobile = useIsMobile();
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (captureMode !== 'manual') {
        setShowAddExpense(true);
      }
      e.target.value = '';
    }
  };

  const handleOpenSheet = (mode: 'manual' | 'upload' | 'camera') => {
    setCaptureMode(mode);
    if (mode === 'manual') {
      setShowAddExpense(true);
    } else if (mode === 'upload' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (mode === 'camera' && cameraInputRef.current) {
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

  return (
    <div className="mt-6">
      <OnboardingTooltip content="Add an expense in different ways" defaultOpen={isNewUser }>
        <div className="bg-white rounded-xl border shadow-lg p-6 transition-transform transform hover:scale-105">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleOpenSheet('manual')} 
              className="h-24 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-2 hover:bg-blue-100 transition duration-200"
              aria-label="Add expense manually"
            >
              <Plus className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Manual Entry</span>
              <span className="text-xs text-gray-500">Enter details yourself</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleOpenSheet('upload')} 
              className="h-24 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-2 hover:bg-blue-100 transition duration-200"
              aria-label="Upload receipt"
            >
              <Upload className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Upload Receipt</span>
              <span className="text-xs text-gray-500">Auto-extract expenses</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleOpenSheet('camera')} 
              className="h-24 w-full flex flex-col items-center justify-center rounded-xl border-dashed space-y-2 hover:bg-blue-100 transition duration-200"
              aria-label="Take photo of receipt"
            >
              <Camera className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Take Photo</span>
              <span className="text-xs text-gray-500">Scan receipt with camera</span>
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
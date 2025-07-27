import React, { useRef, useState, useEffect } from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "../expenses/form-fields/receipt/ReceiptFileInput";
import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/use-currency";

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
  const { currencyCode } = useCurrency();
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Listen for expense form events from various sources including Quick Actions
  useEffect(() => {
    const handleOpenExpenseForm = (event: CustomEvent) => {
      console.log('AddExpenseButton: Received open-expense-form event', event.detail);
      const { mode } = event.detail;
      setCaptureMode(mode || 'manual');
      
      if (mode === 'camera') {
        console.log('AddExpenseButton: Camera mode - triggering camera input');
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        } else {
          console.warn('AddExpenseButton: Camera input ref not available');
        }
      } else if (mode === 'upload') {
        console.log('AddExpenseButton: Upload mode - triggering file input');
        if (fileInputRef.current) {
          fileInputRef.current.click();
        } else {
          console.warn('AddExpenseButton: File input ref not available');
        }
      } else if (mode === 'manual') {
        console.log('AddExpenseButton: Manual mode - opening expense sheet');
        setShowAddExpense(true);
      }
    };

    window.addEventListener('open-expense-form', handleOpenExpenseForm as EventListener);

    return () => {
      window.removeEventListener('open-expense-form', handleOpenExpenseForm as EventListener);
    };
  }, [setShowAddExpense]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('AddExpenseButton: File selected', file.name);
      setSelectedFile(file);

      // For upload or camera modes, we want to auto-process
      if (captureMode === 'upload' || captureMode === 'camera') {
        setShowAddExpense(true);
      }
      e.target.value = '';
    }
  };

  const handleOpenSheet = (mode: 'manual' | 'upload' | 'camera') => {
    console.log('AddExpenseButton: Opening sheet with mode', mode);
    setActiveButton(mode);
    setCaptureMode(mode);
    setTimeout(() => {
      setActiveButton(null);
      if (mode === 'manual') {
        // Just open the manual entry form
        setShowAddExpense(true);
      } else if (mode === 'upload' && fileInputRef.current) {
        // Trigger file upload
        fileInputRef.current.click();
      } else if (mode === 'camera' && cameraInputRef.current) {
        // Trigger camera
        cameraInputRef.current.click();
      }
    }, 300);
  };

  const handleSheetClose = () => {
    console.log('AddExpenseButton: Closing sheet');
    setExpenseToEdit(undefined);
    setShowAddExpense(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Animation variants for the buttons
  const buttonVariants = {
    initial: { scale: 1 },
    active: { 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    hover: { 
      scale: 1.03,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="mt-4">
      <OnboardingTooltip content="Add an expense in different ways" defaultOpen={isNewUser}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-xl border shadow-sm p-3 my-0 py-[19px]"
        >
          <h3 className="text-base font-medium mb-2 flex items-center my-px py-0">
            <Plus className="h-4 w-4 text-primary mr-1.5" />
            Add New Expense
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate={activeButton === 'manual' ? 'active' : 'initial'}
              whileHover="hover"
              whileTap="active"
            >
              <Button
                variant="outline"
                onClick={() => handleOpenSheet('manual')}
                className="h-16 w-full flex flex-col items-center justify-center border-dashed space-y-0.5 hover:bg-accent/30 transition-all my-0 rounded-lg font-normal py-[35px]"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Manual</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Enter details</span>
              </Button>
            </motion.div>
            
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate={activeButton === 'upload' ? 'active' : 'initial'}
              whileHover="hover"
              whileTap="active"
            >
              <Button
                variant="outline"
                onClick={() => handleOpenSheet('upload')}
                className="h-16 w-full flex flex-col items-center justify-center rounded-lg border-dashed space-y-0.5 hover:bg-accent/30 transition-all py-[35px]"
              >
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Upload</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Photo receipt</span>
              </Button>
            </motion.div>
            
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate={activeButton === 'camera' ? 'active' : 'initial'}
              whileHover="hover"
              whileTap="active"
            >
              <Button
                variant="outline"
                onClick={() => handleOpenSheet('camera')}
                className="h-16 w-full flex flex-col items-center justify-center rounded-lg border-dashed space-y-0.5 hover:bg-accent/30 transition-all py-[35px]"
              >
                <Camera className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Camera</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Take photo</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
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

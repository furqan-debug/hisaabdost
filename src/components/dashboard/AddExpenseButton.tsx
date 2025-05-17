
import React, { useRef, useState } from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Expense } from "@/components/expenses/types";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "../expenses/form-fields/receipt/ReceiptFileInput";
import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent } from "@/components/ui/card";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // For upload or camera modes, we want to auto-process
      if (captureMode !== 'manual') {
        setShowAddExpense(true);
      }
      e.target.value = '';
    }
  };

  const handleOpenSheet = (mode: 'manual' | 'upload' | 'camera') => {
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
    setExpenseToEdit(undefined);
    setShowAddExpense(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Animation variants for the buttons
  const buttonVariants = {
    initial: { scale: 1 },
    active: { scale: 0.95, transition: { duration: 0.2 } },
    hover: { scale: 1.03, transition: { duration: 0.2 } }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-3">
        <OnboardingTooltip content="Add an expense in different ways" defaultOpen={isNewUser}>
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Plus className="h-3 w-3 text-primary mr-1" />
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
                  className="h-14 w-full flex flex-col items-center justify-center border-dashed space-y-0.5 hover:bg-accent/30 transition-all text-xs"
                >
                  <Plus className="h-3 w-3 text-primary" />
                  <span>Manual</span>
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
                  className="h-14 w-full flex flex-col items-center justify-center border-dashed space-y-0.5 hover:bg-accent/30 transition-all text-xs"
                >
                  <Upload className="h-3 w-3 text-primary" />
                  <span>Upload</span>
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
                  className="h-14 w-full flex flex-col items-center justify-center border-dashed space-y-0.5 hover:bg-accent/30 transition-all text-xs"
                >
                  <Camera className="h-3 w-3 text-primary" />
                  <span>Camera</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </OnboardingTooltip>
      </CardContent>
      
      <ReceiptFileInput onChange={handleFileChange} inputRef={fileInputRef} id="receipt-upload-button" useCamera={false} />
      <ReceiptFileInput onChange={handleFileChange} inputRef={cameraInputRef} id="camera-capture-button" useCamera={true} />
      
      <AddExpenseSheet 
        onAddExpense={onAddExpense} 
        expenseToEdit={expenseToEdit} 
        onClose={handleSheetClose} 
        open={showAddExpense || expenseToEdit !== undefined} 
        onOpenChange={setShowAddExpense} 
        initialCaptureMode={captureMode} 
        initialFile={selectedFile}
      />
    </Card>
  );
};

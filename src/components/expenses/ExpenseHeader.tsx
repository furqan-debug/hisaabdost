
import { Button } from "@/components/ui/button";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { ReceiptFileInput } from "@/components/expenses/form-fields/receipt/ReceiptFileInput";
import { HeaderTitle } from "./header/HeaderTitle";
import { AddExpenseOptions } from "./header/AddExpenseOptions";
import { ExportActions } from "./header/ExportActions";

interface ExpenseHeaderProps {
  selectedExpenses: Set<string>;
  onDeleteSelected: () => void;
  onAddExpense: () => void;
  expenseToEdit?: Expense;
  onExpenseEditClose: () => void;
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  exportToCSV: () => void;
  exportToPDF: () => void;
}

export function ExpenseHeader({
  selectedExpenses,
  onDeleteSelected,
  onAddExpense,
  expenseToEdit,
  onExpenseEditClose,
  showAddExpense,
  setShowAddExpense,
  exportToCSV,
  exportToPDF
}: ExpenseHeaderProps) {
  const isMobile = useIsMobile();
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandAddOptions, setExpandAddOptions] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

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
    setActiveButton(mode);
    setCaptureMode(mode);
    
    setTimeout(() => {
      setActiveButton(null);
      setExpandAddOptions(false);
      
      if (mode === 'manual') {
        setShowAddExpense(true);
      } else if (mode === 'upload' && fileInputRef.current) {
        fileInputRef.current.click();
      } else if (mode === 'camera' && cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }, 300);
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    setIsExporting(type);
    try {
      if (type === 'csv') {
        exportToCSV();
      } else if (type === 'pdf') {
        exportToPDF();
      }
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
    }
  };

  return (
    <header className={cn(
      "space-y-3 mb-4",
      isMobile ? "px-1" : "flex justify-between items-center space-y-0"
    )}>
      <HeaderTitle />
      
      <div className={cn(
        "flex items-center gap-2",
        isMobile ? "justify-between w-full" : "w-auto justify-end"
      )}>
        <AddExpenseOptions
          expandAddOptions={expandAddOptions}
          setExpandAddOptions={setExpandAddOptions}
          handleOpenSheet={handleOpenSheet}
          activeButton={activeButton}
          isMobile={isMobile}
        />
        
        {selectedExpenses.size > 0 && (
          <Button 
            variant="destructive"
            onClick={onDeleteSelected}
            size={isMobile ? "sm" : "default"}
            className="whitespace-nowrap rounded-lg"
          >
            Delete {selectedExpenses.size > 0 && `(${selectedExpenses.size})`}
          </Button>
        )}
        
        <ExportActions 
          isMobile={isMobile}
          isExporting={isExporting}
          handleExport={handleExport}
        />
        
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
          onClose={onExpenseEditClose}
          open={showAddExpense || expenseToEdit !== undefined}
          onOpenChange={setShowAddExpense}
          initialCaptureMode={captureMode}
          initialFile={selectedFile}
        />
      </div>
    </header>
  );
}


import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ReceiptFileInput } from "@/components/expenses/form-fields/receipt/ReceiptFileInput";
import { ExportActions } from "@/components/expenses/header/ExportActions";
import { useReceiptCapture } from "@/hooks/useReceiptCapture";

interface ExpenseHeaderProps {
  selectedExpenses: Set<string>;
  onDeleteSelected: () => void;
  onAddExpense: () => void;
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  exportToCSV: () => void;
  exportToPDF: () => void;
}

export function ExpenseHeader({
  selectedExpenses,
  onDeleteSelected,
  onAddExpense,
  showAddExpense,
  setShowAddExpense,
  exportToCSV,
  exportToPDF
}: ExpenseHeaderProps) {
  const isMobile = useIsMobile();
  const [expandAddOptions, setExpandAddOptions] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const {
    captureMode,
    setCaptureMode,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileSelection,
    handleUploadAction,
    handleCameraAction
  } = useReceiptCapture();

  const handleFileSelectionWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = handleFileSelection(e);
    if (file) {
      // Always show the AddExpenseSheet which will handle the appropriate mode
      setShowAddExpense(true);
    }
  };

  const handleOpenSheet = async (mode: 'manual' | 'upload' | 'camera') => {
    setActiveButton(mode);
    setCaptureMode(mode);
    
    setTimeout(async () => {
      setActiveButton(null);
      setExpandAddOptions(false);
      
      if (mode === 'manual') {
        setShowAddExpense(true);
      } else if (mode === 'upload') {
        handleUploadAction();
      } else if (mode === 'camera') {
        const file = await handleCameraAction();
        if (file) {
          setShowAddExpense(true);
        }
      }
    }, 300);
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    setIsExporting(type);
    try {
      if (type === 'csv') {
        await exportToCSV();
      } else if (type === 'pdf') {
        await exportToPDF();
      }
    } finally {
      setTimeout(() => setIsExporting(null), 2000);
    }
  };

  const handleSheetClose = () => {
    setShowAddExpense(false);
    setSelectedFile(null);
    setCaptureMode('manual');
  };

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
    <header className={cn(
      "space-y-3 mb-4",
      isMobile ? "px-1" : "flex justify-between items-center space-y-0"
    )}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Expenses
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage and analyze your expenses
        </p>
      </div>
      
      <div className={cn(
        "flex items-center gap-2",
        isMobile ? "justify-between w-full" : "w-auto justify-end"
      )}>
        {expandAddOptions ? (
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
                className="flex-col h-16 items-center justify-center rounded-lg border-dashed space-y-0.5 hover:bg-accent/30 transition-all"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Manual</span>
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
                className="flex-col h-16 items-center justify-center rounded-lg border-dashed space-y-0.5 hover:bg-accent/30 transition-all"
                size={isMobile ? "sm" : "default"}
              >
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Upload</span>
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
                className="flex-col h-16 items-center justify-center rounded-lg border-dashed space-y-0.5 hover:bg-accent/30 transition-all"
                size={isMobile ? "sm" : "default"}
              >
                <Camera className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Camera</span>
              </Button>
            </motion.div>
          </div>
        ) : (
          <Button 
            variant="default" 
            onClick={() => setExpandAddOptions(true)}
            className="rounded-lg"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        )}
        
        {selectedExpenses.size > 0 && (
          <Button 
            variant="destructive"
            onClick={onDeleteSelected}
            size={isMobile ? "sm" : "default"}
            className="whitespace-nowrap rounded-lg"
          >
            Delete {isMobile ? `(${selectedExpenses.size})` : `Selected (${selectedExpenses.size})`}
          </Button>
        )}
        
        <ExportActions 
          isMobile={isMobile}
          isExporting={isExporting}
          handleExport={handleExport}
        />
        
        <ReceiptFileInput 
          onChange={handleFileSelectionWrapper} 
          inputRef={fileInputRef} 
          id="receipt-upload-button" 
          useCamera={false} 
        />
        
        <ReceiptFileInput 
          onChange={handleFileSelectionWrapper} 
          inputRef={cameraInputRef} 
          id="camera-capture-button" 
          useCamera={true} 
        />
        
        <AddExpenseSheet 
          onAddExpense={onAddExpense}
          onClose={handleSheetClose}
          open={showAddExpense}
          onOpenChange={setShowAddExpense}
          initialCaptureMode={captureMode}
          initialFile={selectedFile}
        />
      </div>
    </header>
  );
}

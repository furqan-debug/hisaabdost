
import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ReceiptFileInput } from "@/components/expenses/form-fields/receipt/ReceiptFileInput";
import { useExpenseFile } from "@/hooks/use-expense-file";
import { ExportActions } from "@/components/expenses/header/ExportActions";
import { validateReceiptFile, showReceiptError } from "@/utils/receipt/errorHandling";
import { toast } from "sonner";

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
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  const [expandAddOptions, setExpandAddOptions] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const {
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    triggerFileUpload,
    triggerCameraCapture
  } = useExpenseFile();

  const handleCameraCapture = async () => {
    try {
      const file = await triggerCameraCapture();
      if (file) {
        setCaptureMode('camera');
        setShowAddExpense(true);
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast.error('Camera capture failed. Please try again.');
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    // Validate file before processing
    const validation = validateReceiptFile(file);
    if (!validation.isValid) {
      showReceiptError(validation.error!);
      return;
    }
    
    // Process the file through the hook
    const processedFile = handleFileChange(e);
    if (processedFile) {
      // Always show the AddExpenseSheet which will handle the appropriate mode
      setShowAddExpense(true);
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
      } else if (mode === 'upload') {
        triggerFileUpload();
        } else if (mode === 'camera') {
          handleCameraCapture();
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
          onChange={handleFileSelection} 
          inputRef={fileInputRef} 
          id="receipt-upload-button" 
          useCamera={false} 
        />
        
        <ReceiptFileInput 
          onChange={handleFileSelection} 
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

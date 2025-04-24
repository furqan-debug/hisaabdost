import { Button } from "@/components/ui/button";
import { Download, FileText, FilePdf, Plus, Upload, Camera } from "lucide-react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ReceiptFileInput } from "../expenses/form-fields/receipt/ReceiptFileInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      setExpandAddOptions(false);
      
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
        
        {isMobile ? (
          <>
            {selectedExpenses.size > 0 && (
              <Button 
                variant="destructive"
                onClick={onDeleteSelected}
                size="sm"
                className="whitespace-nowrap rounded-lg"
              >
                Delete ({selectedExpenses.size})
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => handleExport('csv')}
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FilePdf className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            {selectedExpenses.size > 0 && (
              <Button 
                variant="destructive"
                onClick={onDeleteSelected}
                className="whitespace-nowrap rounded-lg"
              >
                Delete Selected ({selectedExpenses.size})
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => handleExport('csv')}
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'csv' ? 'Exporting...' : 'CSV'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting !== null}
                  className="cursor-pointer"
                >
                  <FilePdf className="mr-2 h-4 w-4" />
                  <span>{isExporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        
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

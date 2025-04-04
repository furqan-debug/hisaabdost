
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExpenseForm } from "./expenses/ExpenseForm";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { Expense } from "./expenses/types";
import { ExpenseScanDialog } from "./expenses/form-fields/receipt/ExpenseScanDialog";
import { useScanProcessing } from "@/hooks/useScanProcessing";

interface AddExpenseSheetProps {
  onAddExpense: (expense?: Expense) => void;
  expenseToEdit?: Expense;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialCaptureMode?: 'manual' | 'upload' | 'camera';
  initialFile?: File | null;
}

const AddExpenseSheet = ({ 
  onAddExpense, 
  expenseToEdit, 
  onClose,
  open,
  onOpenChange,
  initialCaptureMode = 'manual', // Default to manual mode
  initialFile = null
}: AddExpenseSheetProps) => {
  const {
    formData,
    isSubmitting,
    isUploading,
    updateField,
    handleFileChange,
    handleSubmit,
    setFileInputRef,
    setCameraInputRef,
    handleScanComplete,
    processReceiptFile
  } = useExpenseForm({ 
    expenseToEdit, 
    onClose,
    onAddExpense
  });

  // Use our scan processing hook
  const {
    showScanDialog,
    setShowScanDialog,
    filePreviewUrl,
    isManualEntry,
    handleScanDialogCleanup,
    handleScanSuccess,
    handleSheetClose
  } = useScanProcessing({
    initialFile,
    initialCaptureMode,
    expenseToEdit,
    open,
    onClose,
    onOpenChange,
    onAddExpense,
    processReceiptFile
  });

  // Debug logging to track sheet and dialog state
  console.log("AddExpenseSheet render state:", {
    open,
    initialCaptureMode,
    isManualEntry,
    showScanDialog,
    hasInitialFile: !!initialFile,
    hasFilePreviewUrl: !!filePreviewUrl
  });

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetClose}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</SheetTitle>
            <SheetDescription>
              {expenseToEdit 
                ? "Edit your expense details below." 
                : isManualEntry
                  ? "Enter expense details manually."
                  : "Upload a receipt for automatic processing."
              }
            </SheetDescription>
          </SheetHeader>
          
          <ExpenseForm
            formData={formData}
            isSubmitting={isSubmitting}
            isEditing={!!expenseToEdit}
            isUploading={isUploading}
            onSubmit={handleSubmit}
            onFieldChange={updateField}
            onFileChange={handleFileChange}
            setFileInputRef={setFileInputRef}
            setCameraInputRef={setCameraInputRef}
            onScanComplete={handleScanComplete}
            isManualEntry={isManualEntry}
          />
        </SheetContent>
      </Sheet>

      {/* Render the scan dialog component */}
      <ExpenseScanDialog
        initialFile={initialFile}
        filePreviewUrl={filePreviewUrl}
        showScanDialog={showScanDialog}
        setShowScanDialog={setShowScanDialog}
        isManualEntry={isManualEntry}
        onCleanup={handleScanDialogCleanup}
        onCapture={handleScanComplete}
        onSuccess={handleScanSuccess}
      />
    </>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";

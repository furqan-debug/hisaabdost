
import { ExpenseFormData } from "@/hooks/useExpenseForm";
import { PaymentMethodField } from "../form-fields/PaymentMethodField";
import { NotesField } from "../form-fields/NotesField";
import { RecurringField } from "../form-fields/RecurringField";
import { ReceiptSection } from "./ReceiptSection";
import { FormSection } from "./FormSection";

interface AdvancedSectionProps {
  formData: ExpenseFormData;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  setFileInputRef?: (ref: HTMLInputElement | null) => void;
  setCameraInputRef?: (ref: HTMLInputElement | null) => void;
  onScanComplete?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  isManualEntry?: boolean;
}

export function AdvancedSection({ 
  formData, 
  onFieldChange,
  onFileChange,
  isUploading = false,
  setFileInputRef,
  setCameraInputRef,
  onScanComplete,
  isManualEntry = false
}: AdvancedSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <FormSection>
        <PaymentMethodField 
          value={formData.paymentMethod} 
          onChange={(value) => onFieldChange('paymentMethod', value)} 
        />
      </FormSection>
      
      <FormSection>
        <NotesField 
          value={formData.notes} 
          onChange={(value) => onFieldChange('notes', value)} 
        />
      </FormSection>
      
      <FormSection>
        <RecurringField 
          value={formData.isRecurring} 
          onChange={(value) => onFieldChange('isRecurring', value)} 
        />
      </FormSection>
      
      <FormSection>
        <ReceiptSection 
          receiptUrl={formData.receiptUrl} 
          onFileChange={onFileChange}
          isUploading={isUploading}
          setFileInputRef={setFileInputRef}
          setCameraInputRef={setCameraInputRef}
          onCapture={onScanComplete}
          isManualForm={isManualEntry}
        />
      </FormSection>
    </div>
  );
}


import { FormSection } from "./form-sections/FormSection";
import { FormActions } from "./form-sections/FormActions";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { CategorySection } from "./form-sections/CategorySection";
import { DetailsSection } from "./form-sections/DetailsSection";
import { ReceiptSection } from "./form-sections/ReceiptSection";
import { ExpenseFormData } from "@/hooks/useExpenseForm";

interface ExpenseFormProps {
  formData: ExpenseFormData;
  isSubmitting: boolean;
  isEditing: boolean;
  isUploading?: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFileInputRef?: (ref: HTMLInputElement | null) => void;
  setCameraInputRef?: (ref: HTMLInputElement | null) => void;
  onScanComplete?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
}

export function ExpenseForm({
  formData,
  isSubmitting,
  isEditing,
  isUploading = false,
  onSubmit,
  onFieldChange,
  onFileChange,
  setFileInputRef,
  setCameraInputRef,
  onScanComplete
}: ExpenseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <FormSection>
        <BasicInfoSection 
          formData={formData} 
          onFieldChange={onFieldChange} 
        />
      </FormSection>
      
      <FormSection>
        <CategorySection 
          formData={formData} 
          onFieldChange={onFieldChange} 
        />
      </FormSection>
      
      <FormSection>
        <DetailsSection 
          formData={formData} 
          onFieldChange={onFieldChange} 
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
        />
      </FormSection>

      <FormActions 
        isSubmitting={isSubmitting || isUploading} 
        isEditing={isEditing} 
      />
    </form>
  );
}

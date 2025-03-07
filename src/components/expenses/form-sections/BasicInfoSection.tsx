
import { ExpenseFormData } from "@/hooks/useExpenseForm";
import { DescriptionField } from "../form-fields/DescriptionField";
import { AmountField } from "../form-fields/AmountField";

interface BasicInfoSectionProps {
  formData: ExpenseFormData;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function BasicInfoSection({ formData, onFieldChange }: BasicInfoSectionProps) {
  return (
    <>
      <DescriptionField 
        value={formData.description} 
        onChange={(value) => onFieldChange('description', value)} 
      />
      
      <AmountField 
        value={formData.amount} 
        onChange={(value) => onFieldChange('amount', value)} 
      />
    </>
  );
}

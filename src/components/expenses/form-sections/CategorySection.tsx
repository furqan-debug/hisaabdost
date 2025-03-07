
import { ExpenseFormData } from "@/hooks/useExpenseForm";
import { CategoryField } from "../form-fields/CategoryField";
import { PaymentMethodField } from "../form-fields/PaymentMethodField";

interface CategorySectionProps {
  formData: ExpenseFormData;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function CategorySection({ formData, onFieldChange }: CategorySectionProps) {
  return (
    <>
      <CategoryField 
        value={formData.category} 
        onChange={(value) => onFieldChange('category', value)} 
      />
      
      <PaymentMethodField 
        value={formData.paymentMethod} 
        onChange={(value) => onFieldChange('paymentMethod', value)} 
      />
    </>
  );
}

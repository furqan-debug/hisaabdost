
import { ExpenseFormData } from "@/hooks/useExpenseForm";
import { CategoryField } from "../form-fields/CategoryField";
import { DateField } from "../form-fields/DateField";

interface CategorySectionProps {
  formData: ExpenseFormData;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function CategorySection({ formData, onFieldChange }: CategorySectionProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <DateField 
        value={formData.date} 
        onChange={(value) => onFieldChange('date', value)} 
      />
      
      <CategoryField 
        value={formData.category} 
        onChange={(value) => onFieldChange('category', value)} 
      />
    </div>
  );
}

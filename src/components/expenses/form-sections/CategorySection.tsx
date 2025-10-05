import { ExpenseFormData } from "@/hooks/useExpenseForm";
import { CategoryIconPicker } from "../form-fields/CategoryIconPicker";
import { DateField } from "../form-fields/DateField";

interface CategorySectionProps {
  formData: ExpenseFormData;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function CategorySection({
  formData,
  onFieldChange
}: CategorySectionProps) {
  console.log('CategorySection rendering with CategoryIconPicker');
  
  return (
    <div className="space-y-4 px-[2px]">
      <DateField value={formData.date} onChange={value => onFieldChange('date', value)} />
      <CategoryIconPicker value={formData.category} onChange={value => onFieldChange('category', value)} />
    </div>
  );
}
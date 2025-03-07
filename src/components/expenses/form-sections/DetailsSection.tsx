
import { ExpenseFormData } from "@/hooks/useExpenseForm";
import { DateField } from "../form-fields/DateField";
import { NotesField } from "../form-fields/NotesField";
import { RecurringField } from "../form-fields/RecurringField";

interface DetailsSectionProps {
  formData: ExpenseFormData;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function DetailsSection({ formData, onFieldChange }: DetailsSectionProps) {
  return (
    <>
      <DateField 
        value={formData.date} 
        onChange={(value) => onFieldChange('date', value)} 
      />
      
      <NotesField 
        value={formData.notes} 
        onChange={(value) => onFieldChange('notes', value)} 
      />
      
      <RecurringField 
        value={formData.isRecurring} 
        onChange={(value) => onFieldChange('isRecurring', value)} 
      />
    </>
  );
}

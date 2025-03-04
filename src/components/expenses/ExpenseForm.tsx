
import { Button } from "@/components/ui/button";
import { DescriptionField } from "./form-fields/DescriptionField";
import { AmountField } from "./form-fields/AmountField";
import { CategoryField } from "./form-fields/CategoryField";
import { PaymentMethodField } from "./form-fields/PaymentMethodField";
import { DateField } from "./form-fields/DateField";
import { NotesField } from "./form-fields/NotesField";
import { RecurringField } from "./form-fields/RecurringField";
import { ReceiptField } from "./form-fields/ReceiptField";
import { ExpenseFormData } from "@/hooks/useExpenseForm";

interface ExpenseFormProps {
  formData: ExpenseFormData;
  isSubmitting: boolean;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFieldChange: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScanComplete: (expenseDetails: { 
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
  onSubmit,
  onFieldChange,
  onFileChange,
  onScanComplete
}: ExpenseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <DescriptionField 
        value={formData.description} 
        onChange={(value) => onFieldChange('description', value)} 
      />
      
      <AmountField 
        value={formData.amount} 
        onChange={(value) => onFieldChange('amount', value)} 
      />
      
      <CategoryField 
        value={formData.category} 
        onChange={(value) => onFieldChange('category', value)} 
      />
      
      <PaymentMethodField 
        value={formData.paymentMethod} 
        onChange={(value) => onFieldChange('paymentMethod', value)} 
      />
      
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
      
      <ReceiptField 
        receiptUrl={formData.receiptUrl} 
        onFileChange={onFileChange} 
        onScanComplete={onScanComplete}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Add Expense")}
      </Button>
    </form>
  );
}


import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  isEditing: boolean;
}

export function FormActions({ isSubmitting, isEditing }: FormActionsProps) {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Save Expense")}
    </Button>
  );
}

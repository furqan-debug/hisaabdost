
import { useState } from "react";
import { FormSection } from "./form-sections/FormSection";
import { FormActions } from "./form-sections/FormActions";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { CategorySection } from "./form-sections/CategorySection";
import { AdvancedSection } from "./form-sections/AdvancedSection";
import { ExpenseFormData } from "@/hooks/useExpenseForm";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  isManualEntry?: boolean;
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
  onScanComplete,
  isManualEntry = true
}: ExpenseFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Basic Fields */}
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

      {/* Advanced Toggle Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full justify-between text-sm text-muted-foreground hover:text-foreground"
      >
        Advanced Options
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* Advanced Fields */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <AdvancedSection
              formData={formData}
              onFieldChange={onFieldChange}
              onFileChange={onFileChange}
              isUploading={isUploading}
              setFileInputRef={setFileInputRef}
              setCameraInputRef={setCameraInputRef}
              onScanComplete={onScanComplete}
              isManualEntry={isManualEntry}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <FormActions 
        isSubmitting={isSubmitting || isUploading} 
        isEditing={isEditing} 
      />
    </form>
  );
}

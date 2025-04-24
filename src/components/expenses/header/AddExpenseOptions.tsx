import { Button } from "@/components/ui/button";
import { Plus, Upload, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/utils/animations";

interface AddExpenseOptionsProps {
  expandAddOptions: boolean;
  setExpandAddOptions: (expand: boolean) => void;
  handleOpenSheet: (mode: 'manual' | 'upload' | 'camera') => void;
  activeButton: string | null;
  isMobile: boolean;
}

export function AddExpenseOptions({
  expandAddOptions,
  setExpandAddOptions,
  handleOpenSheet,
  activeButton,
  isMobile
}: AddExpenseOptionsProps) {
  if (expandAddOptions) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[
          { mode: 'manual', icon: Plus, label: 'Manual' },
          { mode: 'upload', icon: Upload, label: 'Upload' },
          { mode: 'camera', icon: Camera, label: 'Camera' }
        ].map(({ mode, icon: Icon, label }) => (
          <motion.div
            key={mode}
            variants={buttonVariants}
            initial="initial"
            animate={activeButton === mode ? 'active' : 'initial'}
            whileHover="hover"
            whileTap="active"
          >
            <Button 
              variant="outline" 
              onClick={() => handleOpenSheet(mode as 'manual' | 'upload' | 'camera')} 
              className="flex-col h-16 items-center justify-center rounded-lg border-dashed space-y-0.5 hover:bg-accent/30 transition-all"
              size={isMobile ? "sm" : "default"}
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Button 
      variant="default" 
      onClick={() => setExpandAddOptions(true)}
      className="rounded-lg"
      size={isMobile ? "sm" : "default"}
    >
      <Plus className="h-4 w-4 mr-1" />
      Add Expense
    </Button>
  );
}

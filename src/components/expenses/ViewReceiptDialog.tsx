
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage } from "lucide-react";

interface ViewReceiptDialogProps {
  receiptUrl?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ViewReceiptDialog({ receiptUrl, open: externalOpen, onOpenChange: externalOnOpenChange }: ViewReceiptDialogProps) {
  // Internal state for when the component is used without external control
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use external or internal state based on what's provided
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const handleOpenChange = externalOnOpenChange || setInternalOpen;
  
  const handleDownload = () => {
    if (receiptUrl) {
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-${new Date().toISOString().slice(0, 10)}.${receiptUrl.split('.').pop()}`;
      link.click();
    }
  };

  return (
    <>
      {/* Only show the button when used without external control */}
      {externalOpen === undefined && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setInternalOpen(true)}
          title="View Receipt"
        >
          <FileImage className="h-4 w-4" />
        </Button>
      )}
      
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Receipt</span>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1 relative h-full">
            {receiptUrl && (
              <img
                src={receiptUrl}
                alt="Receipt"
                className="w-full h-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ViewReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl?: string;
}

export function ViewReceiptDialog({ open, onOpenChange, receiptUrl }: ViewReceiptDialogProps) {
  const handleDownload = () => {
    if (receiptUrl) {
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-${new Date().toISOString().slice(0, 10)}.${receiptUrl.split('.').pop()}`;
      link.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}

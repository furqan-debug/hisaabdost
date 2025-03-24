
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function ViewReceiptDialog({ 
  receiptUrl, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange 
}: ViewReceiptDialogProps) {
  // Internal state for when the component is used without external control
  const [internalOpen, setInternalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use external or internal state based on what's provided
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const handleOpenChange = externalOnOpenChange || setInternalOpen;
  
  // Reset image error state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
    }
  }, [isOpen]);
  
  const handleDownload = () => {
    if (!receiptUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-${new Date().toISOString().split('T')[0]}.${receiptUrl.split('.').pop() || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!receiptUrl) return null;

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
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Receipt</span>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogTitle>
            <DialogDescription className="sr-only">
              View and download expense receipt
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 relative flex items-center justify-center bg-black/5 rounded-md p-4">
            {receiptUrl && !imageError ? (
              <img
                src={receiptUrl}
                alt="Receipt"
                className="max-h-full max-w-full object-contain"
                onError={handleImageError}
              />
            ) : (
              <div className="text-center p-4">
                <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {imageError 
                    ? "Unable to display receipt image" 
                    : "No receipt image available"}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

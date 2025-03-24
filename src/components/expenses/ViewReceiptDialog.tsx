
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage } from "lucide-react";
import { toast } from "sonner";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use external or internal state based on what's provided
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const handleOpenChange = (open: boolean) => {
    // Use the external handler if provided, otherwise use the internal one
    if (externalOnOpenChange) {
      externalOnOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };
  
  // Reset image states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [isOpen]);
  
  const handleDownload = () => {
    if (!receiptUrl) return;
    
    try {
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-${new Date().toISOString().split('T')[0]}.${receiptUrl.split('.').pop() || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download receipt");
    }
  };

  const handleImageError = () => {
    console.error("Image failed to load:", receiptUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
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
      
      <Dialog 
        open={isOpen} 
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Receipt</span>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogTitle>
            <DialogDescription>
              View and download your expense receipt
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 relative flex items-center justify-center bg-black/5 rounded-md p-4">
            {receiptUrl && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                )}
                <img
                  src={receiptUrl}
                  alt="Receipt"
                  className="max-h-full max-w-full object-contain"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                />
              </>
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

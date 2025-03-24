
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage, ImageOff, X } from "lucide-react";
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
  // Internal state
  const [internalOpen, setInternalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Use external or internal state based on what's provided
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (value: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };
  
  // Handle image loading state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [isOpen]);
  
  // Track if component is mounted
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const handleDownload = () => {
    if (!receiptUrl || imageError) return;
    
    try {
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-${new Date().toISOString().split('T')[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download receipt");
    }
  };

  const handleImageLoad = () => {
    if (isMounted.current) {
      setImageLoading(false);
      setImageError(false);
    }
  };

  const handleImageError = () => {
    if (isMounted.current) {
      setImageError(true);
      setImageLoading(false);
    }
  };
  
  const handleCloseDialog = () => {
    setIsOpen(false);
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
        onOpenChange={setIsOpen}
      >
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Receipt</span>
              <Button variant="outline" onClick={handleDownload} disabled={imageError}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogTitle>
            <DialogDescription>
              View and download your expense receipt
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto flex-1 relative flex items-center justify-center bg-black/5 rounded-md p-4">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            )}
            
            {!imageError ? (
              // Use a key to force re-render when the dialog opens
              <img
                key={`receipt-img-${isOpen}`}
                ref={imageRef}
                src={receiptUrl}
                alt="Receipt"
                className="max-h-full max-w-full object-contain"
                style={{ 
                  opacity: imageLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="text-center p-4">
                <ImageOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Unable to display receipt image
                </p>
              </div>
            )}
          </div>
          
          {/* Custom close button with focus on proper cleanup */}
          <Button
            onClick={handleCloseDialog}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

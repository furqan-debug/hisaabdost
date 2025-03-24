
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
  const [loadAttempts, setLoadAttempts] = useState(0);
  
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
      setLoadAttempts(0);
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
    if (!receiptUrl) return;
    
    try {
      // For blob URLs, we need to fetch the data and create a new download
      if (receiptUrl.startsWith('blob:')) {
        fetch(receiptUrl)
          .then(response => response.blob())
          .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `receipt-${new Date().toISOString().split('T')[0]}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl); // Clean up
            toast.success("Receipt downloaded successfully");
          })
          .catch(error => {
            console.error("Blob download failed:", error);
            toast.error("Failed to download receipt");
          });
      } else {
        // Regular URL download
        const link = document.createElement('a');
        link.href = receiptUrl;
        link.download = `receipt-${new Date().toISOString().split('T')[0]}.${receiptUrl.split('.').pop() || 'jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Receipt downloaded successfully");
      }
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
      console.error("Image failed to load:", receiptUrl);
      setImageError(true);
      setImageLoading(false);
      
      // Try to reload the image a few times (helpful for blob URLs)
      if (loadAttempts < 2) {
        setLoadAttempts(prev => prev + 1);
        // Add a small delay before retrying
        setTimeout(() => {
          if (isMounted.current) {
            setImageLoading(true);
            setImageError(false);
          }
        }, 500);
      }
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
            
            {receiptUrl && !imageError ? (
              <img
                key={`receipt-img-${loadAttempts}`}
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
                  {imageError 
                    ? "Unable to display receipt image" 
                    : "No receipt image available"}
                </p>
              </div>
            )}
          </div>
          
          {/* Custom close button to ensure proper state cleanup */}
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

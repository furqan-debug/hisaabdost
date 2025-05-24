
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileImage, Download, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ViewReceiptDialogProps {
  receiptUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReceiptDialog({ 
  receiptUrl,
  open,
  onOpenChange
}: ViewReceiptDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    console.error("Failed to load receipt image:", receiptUrl);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setImageError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleDownload = () => {
    try {
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = receiptUrl;
      a.download = 'receipt-image.jpg'; // Default filename
      a.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(receiptUrl, '_blank');
    }
  };

  // Reset states when dialog opens/closes or URL changes
  const resetStates = () => {
    setIsLoading(true);
    setImageError(false);
    setRetryCount(0);
  };

  // Reset when dialog opens or URL changes
  React.useEffect(() => {
    if (open) {
      resetStates();
    }
  }, [open, receiptUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileImage className="mr-2 h-5 w-5" />
            Receipt Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex flex-col items-center justify-center min-h-[200px]">
          {isLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}
          
          {!imageError ? (
            <img
              key={`${receiptUrl}-${retryCount}`} // Force reload on retry
              src={receiptUrl}
              alt="Receipt"
              className="max-h-[60vh] max-w-full object-contain rounded-md border"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ opacity: isLoading ? 0.3 : 1 }}
            />
          ) : (
            <div className="p-8 text-center border border-dashed rounded-md bg-muted/30">
              <FileImage className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Failed to load receipt image. The image may be missing or inaccessible.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
          
          {!isLoading && !imageError && (
            <p className="mt-2 text-sm text-muted-foreground">
              Click outside or press ESC to close
            </p>
          )}
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          {!imageError && (
            <Button 
              variant="secondary" 
              onClick={handleDownload}
              className="ml-2"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import React from "react";
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

  // Debug the URL
  console.log("ViewReceiptDialog URL:", receiptUrl);
  
  // Check URL type
  const isBlobUrl = receiptUrl?.startsWith('blob:');
  const isSupabaseUrl = receiptUrl?.includes('supabase');
  const hasValidUrl = receiptUrl && receiptUrl.trim() !== '';
  const isHttpUrl = receiptUrl?.startsWith('http');

  console.log("URL analysis:", {
    isBlobUrl,
    isSupabaseUrl,
    hasValidUrl,
    isHttpUrl,
    url: receiptUrl
  });

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Image failed to load:", receiptUrl, e);
    setIsLoading(false);
    setImageError(true);
  };

  const handleRetry = () => {
    if (!hasValidUrl || isBlobUrl) {
      console.log("Cannot retry: invalid URL or blob URL");
      return;
    }
    console.log("Retrying image load");
    setIsLoading(true);
    setImageError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleDownload = () => {
    if (!hasValidUrl || isBlobUrl) {
      console.log("Cannot download: invalid URL or blob URL");
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = receiptUrl;
      a.download = 'receipt-image.jpg';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(receiptUrl, '_blank');
    }
  };

  // Reset states when dialog opens/closes or URL changes
  const resetStates = () => {
    setIsLoading(true);
    setImageError(false);
    setRetryCount(0);
  };

  React.useEffect(() => {
    if (open) {
      console.log("Dialog opened, resetting states");
      resetStates();
      
      // If blob URL, immediately show error
      if (isBlobUrl) {
        console.log("Blob URL detected, showing error immediately");
        setIsLoading(false);
        setImageError(true);
      }
    }
  }, [open, receiptUrl, isBlobUrl]);

  const handleClose = () => {
    resetStates();
    onOpenChange(false);
  };

  // Determine error message based on URL type
  const getErrorMessage = () => {
    if (!hasValidUrl) {
      return "No receipt image available.";
    }
    if (isBlobUrl) {
      return "Receipt image is no longer available. The temporary preview has expired.";
    }
    if (!isHttpUrl) {
      return "Invalid receipt image URL.";
    }
    return "Failed to load receipt image. The image may be missing or inaccessible.";
  };

  const canRetry = hasValidUrl && !isBlobUrl && isHttpUrl;
  const canDownload = hasValidUrl && !isBlobUrl && isHttpUrl;
  const shouldShowImage = hasValidUrl && !isBlobUrl && isHttpUrl;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileImage className="mr-2 h-5 w-5" />
            Receipt Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex flex-col items-center justify-center min-h-[200px]">
          {isLoading && !imageError && shouldShowImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}
          
          {!imageError && shouldShowImage ? (
            <img
              key={`${receiptUrl}-${retryCount}`}
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
                {getErrorMessage()}
              </p>
              {canRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
            </div>
          )}
          
          {!isLoading && !imageError && shouldShowImage && (
            <p className="mt-2 text-sm text-muted-foreground">
              Click outside or press ESC to close
            </p>
          )}
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          
          {canDownload && !imageError && (
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

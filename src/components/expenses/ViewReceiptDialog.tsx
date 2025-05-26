
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

  console.log("ViewReceiptDialog received URL:", receiptUrl);
  
  // Check URL validity - Supabase URLs are always valid and permanent
  const hasValidUrl = receiptUrl && receiptUrl.trim() !== '';
  const isSupabaseUrl = receiptUrl?.includes('supabase.co') || receiptUrl?.includes('.supabase.co');
  const isBlobUrl = receiptUrl?.startsWith('blob:');
  const isHttpUrl = receiptUrl?.startsWith('http');
  
  // Supabase URLs are always permanent and valid
  const isValidImageUrl = hasValidUrl && (isSupabaseUrl || isBlobUrl || isHttpUrl);
  const isPermanentUrl = isSupabaseUrl || (isHttpUrl && !isBlobUrl);
  
  console.log("URL analysis:", {
    hasValidUrl,
    isSupabaseUrl,
    isBlobUrl,
    isHttpUrl,
    isValidImageUrl,
    isPermanentUrl,
    url: receiptUrl
  });

  const handleImageLoad = () => {
    console.log("Receipt image loaded successfully");
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Receipt image failed to load:", receiptUrl, e);
    setIsLoading(false);
    setImageError(true);
  };

  const handleRetry = () => {
    if (!isValidImageUrl) {
      console.log("Cannot retry: invalid URL");
      return;
    }
    console.log("Retrying image load, attempt:", retryCount + 1);
    setIsLoading(true);
    setImageError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleDownload = () => {
    if (!isPermanentUrl) {
      console.log("Cannot download: URL is not permanent");
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

  // Reset states when dialog opens - ALWAYS reset imageError to false
  React.useEffect(() => {
    if (open) {
      console.log("Dialog opened, resetting states for URL:", receiptUrl);
      setIsLoading(true);
      setImageError(false); // Always reset to false when dialog opens
      setRetryCount(0);
    }
  }, [open, receiptUrl]); // Depend on both open and receiptUrl

  const handleClose = () => {
    setIsLoading(true);
    setImageError(false);
    setRetryCount(0);
    onOpenChange(false);
  };

  // Determine error message - be more specific about error types
  const getErrorMessage = () => {
    if (!hasValidUrl) {
      return "No receipt image available.";
    }
    // Only show expired message for actual blob URLs that start with blob:
    if (isBlobUrl) {
      return "Receipt image URL is temporary and may have expired. Please re-upload the receipt.";
    }
    // For all other URL types (including Supabase), show generic error
    return "Failed to load receipt image. Please try again.";
  };

  const canRetry = isValidImageUrl;
  const canDownload = isPermanentUrl;
  const shouldShowImage = isValidImageUrl && !imageError; // Only show image if no error

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
          {isLoading && shouldShowImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}
          
          {shouldShowImage ? (
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
          
          {!isLoading && shouldShowImage && (
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

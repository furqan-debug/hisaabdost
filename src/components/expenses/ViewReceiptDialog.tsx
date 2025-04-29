
import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { addBlobUrlReference, markBlobUrlForCleanup, forceCleanupAllBlobUrls } from "@/utils/blobUrlManager";

interface ViewReceiptDialogProps {
  receiptUrl?: string | null;
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
  const [imageSrc, setImageSrc] = useState<string | undefined | null>(receiptUrl);
  const imageRef = useRef<HTMLImageElement>(null);
  const dialogOpenTime = useRef<number>(0);
  const cleanupAttempted = useRef(false);

  // Use external or internal state based on what's provided
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = useCallback((value: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  }, [externalOnOpenChange]);

  // Handle image loading state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setImageLoading(true);
      setImageError(false);
      dialogOpenTime.current = Date.now();
      cleanupAttempted.current = false;

      // Update image source when dialog opens
      if (receiptUrl !== imageSrc) {
        setImageSrc(receiptUrl);
      }

      // For blob URLs, add a reference
      if (receiptUrl && receiptUrl.startsWith('blob:')) {
        addBlobUrlReference(receiptUrl);
      }
    } else if (!isOpen && receiptUrl) {
      // Cleanup with longer delay when dialog closes
      if (receiptUrl.startsWith('blob:')) {
        // Add a longer delay before cleanup to ensure smooth transitions
        setTimeout(() => {
          if (receiptUrl) {
            console.log("Marking blob URL for cleanup after dialog close:", receiptUrl);
            markBlobUrlForCleanup(receiptUrl);
          }
        }, 1000);
      }
    }
  }, [isOpen, receiptUrl, imageSrc]);

  // Track if component is mounted
  const isMounted = useRef(true);
  
  // Dedicated cleanup function for consistency
  const performCleanup = useCallback(() => {
    if (cleanupAttempted.current) return;
    
    cleanupAttempted.current = true;
    console.log("Performing dialog cleanup, receipt URL:", receiptUrl);
    
    if (receiptUrl && receiptUrl.startsWith('blob:')) {
      try {
        console.log("Marking blob URL for cleanup on unmount:", receiptUrl);
        markBlobUrlForCleanup(receiptUrl);
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    }
  }, [receiptUrl]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      
      // Cleanup on unmount with safeguards
      try {
        performCleanup();
        
        // As a last resort, use the force cleanup after a delay
        // This ensures the UI doesn't freeze by cleaning up any leftover blob URLs
        setTimeout(() => {
          if (!isMounted.current) {
            console.log("Performing emergency blob URL cleanup on unmount");
            forceCleanupAllBlobUrls();
          }
        }, 500);
      } catch (error) {
        console.error("Error during unmount cleanup:", error);
      }
    };
  }, [receiptUrl, performCleanup]);
  
  const handleDownload = useCallback(() => {
    if (!receiptUrl || imageError) return;
    try {
      // Skip downloading for blob URLs
      if (receiptUrl.startsWith('blob:')) {
        toast.error("Cannot download temporary receipt images");
        return;
      }

      // For remote URLs (not blob URLs)
      fetch(receiptUrl, {
        mode: 'cors',
        credentials: 'same-origin'
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      }).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${new Date().toISOString().split('T')[0]}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL after a short delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        toast.success("Receipt downloaded successfully");
      }).catch(err => {
        console.error("Download failed:", err);
        toast.error("Failed to download receipt");
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download receipt");
    }
  }, [receiptUrl, imageError]);
  
  const handleImageLoad = useCallback(() => {
    if (isMounted.current) {
      console.log("Image loaded successfully in dialog:", receiptUrl);
      setImageLoading(false);
      setImageError(false);
    }
  }, [receiptUrl]);
  
  const handleImageError = useCallback(() => {
    if (isMounted.current) {
      // If error happens immediately after opening dialog, it might be a timing issue
      const timeOpenMs = Date.now() - dialogOpenTime.current;
      if (timeOpenMs < 100) {
        console.log("Image error occurred too quickly, delaying error state");
        // Delay setting error to avoid false positives
        setTimeout(() => {
          if (isMounted.current) {
            console.error("Image failed to load in dialog after delay:", receiptUrl);
            setImageError(true);
            setImageLoading(false);
          }
        }, 300);
      } else {
        console.error("Image failed to load in dialog:", receiptUrl);
        setImageError(true);
        setImageLoading(false);
      }
    }
  }, [receiptUrl]);
  
  const handleCloseDialog = useCallback(() => {
    setIsOpen(false);
    
    // Ensure cleanup happens on manual close
    if (receiptUrl && receiptUrl.startsWith('blob:')) {
      setTimeout(() => {
        if (receiptUrl) {
          console.log("Manual close - marking blob URL for cleanup:", receiptUrl);
          markBlobUrlForCleanup(receiptUrl);
        }
      }, 500);
    }
  }, [setIsOpen, receiptUrl]);

  // Determine if receipt is a blob URL
  const isBlobUrl = receiptUrl?.startsWith('blob:') || false;

  // If no receipt URL provided, don't render the component
  if (!receiptUrl) return null;
  
  return <>
      {/* Only show the button when used without external control */}
      {externalOpen === undefined && <Button variant="ghost" size="icon" onClick={() => setInternalOpen(true)} title="View Receipt">
          <FileImage className="h-4 w-4" />
        </Button>}
      
      <Dialog 
        open={isOpen} 
        onOpenChange={(newOpen) => {
          setIsOpen(newOpen);
          if (!newOpen) {
            // Run cleanup with a delay on close
            setTimeout(performCleanup, 500);
          }
        }}
      >
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Receipt</span>
              <Button variant="outline" onClick={handleDownload} disabled={imageError || isBlobUrl} title={isBlobUrl ? "Cannot download temporary receipts" : undefined} className="px-[5px] my-[6px]">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogTitle>
            <DialogDescription>
              {isBlobUrl ? "Preview of your receipt image" : "View and download your expense receipt"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto flex-1 relative flex items-center justify-center bg-black/5 rounded-md p-4">
            {imageLoading && !imageError && <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>}
            
            {!imageError ?
              <img 
                key={`receipt-img-${isOpen}-${Date.now()}`} 
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
                crossOrigin="anonymous" 
                loading="eager" 
              /> : 
              <div className="text-center p-4">
                <ImageOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Unable to display receipt image
                </p>
              </div>
            }
            
            {isBlobUrl && !imageError && <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="inline-block px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                  Temporary preview
                </div>
              </div>}
          </div>
        </DialogContent>
      </Dialog>
    </>;
}

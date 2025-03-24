
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { FileImage, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptPreviewProps {
  receiptUrl: string;
  onReplace: () => void;
}

export function ReceiptPreview({ receiptUrl, onReplace }: ReceiptPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Reset states when receipt URL changes
  useEffect(() => {
    if (receiptUrl) {
      setImageLoaded(false);
      setImageError(false);
      // Small delay to ensure UI updates
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [receiptUrl]);
  
  if (!receiptUrl) return null;
  
  const isImage = !!receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i) || receiptUrl.startsWith('blob:');
  
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  const handleImageError = () => {
    console.error("Receipt preview image failed to load:", receiptUrl);
    setImageError(true);
    setImageLoaded(false);
  };
  
  return (
    <div className="relative group overflow-hidden rounded-md">
      {isImage ? (
        <>
          {!imageLoaded && !imageError && (
            <div className="h-32 w-full rounded-md border flex items-center justify-center bg-muted">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          )}
          
          {isVisible && (
            <img
              src={receiptUrl}
              alt="Receipt preview"
              className={cn(
                "max-h-32 w-full rounded-md border object-cover",
                !imageLoaded && "hidden"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {imageError && (
            <div className="h-32 rounded-md border bg-muted flex flex-col items-center justify-center gap-2">
              <ImageOff className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Failed to load receipt image
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="h-32 rounded-md border bg-muted flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Receipt document uploaded
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onReplace}
        >
          Replace
        </Button>
      </div>
    </div>
  );
}

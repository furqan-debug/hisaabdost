
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ReceiptPreviewProps {
  receiptUrl: string;
  onReplace: () => void;
}

export function ReceiptPreview({ receiptUrl, onReplace }: ReceiptPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (!receiptUrl) return null;
  
  const isImage = !!receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i) || receiptUrl.startsWith('blob:');
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageError = () => {
    setImageError(true);
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
          <img
            src={receiptUrl}
            alt="Receipt preview"
            className="max-h-32 w-full rounded-md border object-cover"
            style={{ display: imageLoaded ? 'block' : 'none' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {imageError && (
            <div className="h-32 rounded-md border bg-muted flex items-center justify-center">
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

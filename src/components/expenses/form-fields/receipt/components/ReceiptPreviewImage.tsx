
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ReceiptPreviewImageProps {
  previewUrl: string | null;
  className?: string;
}

export function ReceiptPreviewImage({ 
  previewUrl, 
  className 
}: ReceiptPreviewImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset states when the URL changes
  useEffect(() => {
    if (previewUrl) {
      setHasError(false);
      setIsLoading(true);
    }
  }, [previewUrl]);
  
  if (!previewUrl) return null;
  
  // Handle blob URL formatting
  const isBlobUrl = previewUrl.startsWith('blob:');
  
  return (
    <div className={cn("w-full flex justify-center relative", className)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="bg-muted p-4 rounded-md flex items-center justify-center h-32 w-full max-w-[240px]">
          <p className="text-sm text-muted-foreground">Receipt image unavailable</p>
        </div>
      ) : (
        <img 
          src={previewUrl} 
          alt="Receipt preview" 
          className="max-h-52 rounded-md object-contain border bg-background" 
          onError={() => {
            console.log("Image failed to load:", previewUrl);
            setHasError(true);
            setIsLoading(false);
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", previewUrl);
            setIsLoading(false);
          }}
          loading="lazy"
        />
      )}
      
      {!hasError && isBlobUrl && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground p-1 bg-black/20 rounded-b-md">
          Preview only
        </div>
      )}
    </div>
  );
}

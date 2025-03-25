
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReceiptPreviewImageProps {
  previewUrl: string | null;
  className?: string;
}

export function ReceiptPreviewImage({ 
  previewUrl, 
  className 
}: ReceiptPreviewImageProps) {
  const [hasError, setHasError] = useState(false);
  
  if (!previewUrl) return null;
  
  // Handle blob URL formatting
  const isBlobUrl = previewUrl.startsWith('blob:');
  
  return (
    <div className={cn("w-full flex justify-center", className)}>
      {hasError ? (
        <div className="bg-muted p-4 rounded-md flex items-center justify-center h-32 w-full max-w-[240px]">
          <p className="text-sm text-muted-foreground">Receipt image unavailable</p>
        </div>
      ) : (
        <img 
          src={previewUrl} 
          alt="Receipt preview" 
          className="max-h-52 rounded-md object-contain border bg-background" 
          onError={() => setHasError(true)}
          loading="lazy"
        />
      )}
      {isBlobUrl && (
        <div className="absolute bottom-0 w-full text-center text-xs text-muted-foreground p-1 bg-black/20">
          Preview only
        </div>
      )}
    </div>
  );
}

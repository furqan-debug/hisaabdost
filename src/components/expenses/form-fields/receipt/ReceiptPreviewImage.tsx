
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReceiptPreviewImageProps {
  url: string | null;
  className?: string;
  onLoad?: () => void;
}

export function ReceiptPreviewImage({ 
  url, 
  className,
  onLoad 
}: ReceiptPreviewImageProps) {
  const [hasError, setHasError] = useState(false);
  
  if (!url) return null;
  
  // Handle blob URL formatting
  const isBlobUrl = url.startsWith('blob:');
  
  return (
    <div className={cn("w-full flex justify-center", className)}>
      {hasError ? (
        <div className="bg-muted p-4 rounded-md flex items-center justify-center h-32 w-full max-w-[240px]">
          <p className="text-sm text-muted-foreground">Receipt image unavailable</p>
        </div>
      ) : (
        <img 
          src={url} 
          alt="Receipt preview" 
          className="max-h-52 rounded-md object-contain border bg-background" 
          onError={() => setHasError(true)}
          onLoad={onLoad}
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

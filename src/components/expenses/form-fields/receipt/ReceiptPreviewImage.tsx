
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReceiptPreviewImageProps {
  url: string | null;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ReceiptPreviewImage({ 
  url, 
  className,
  onLoad,
  onError
}: ReceiptPreviewImageProps) {
  const [hasError, setHasError] = useState(false);
  
  if (!url) return null;
  
  console.log("ReceiptPreviewImage rendering URL:", url);
  
  const handleError = () => {
    console.log("ReceiptPreviewImage error for URL:", url);
    setHasError(true);
    if (onError) onError();
  };

  const handleLoad = () => {
    console.log("ReceiptPreviewImage loaded successfully for URL:", url);
    setHasError(false);
    if (onLoad) onLoad();
  };
  
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
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
    </div>
  );
}

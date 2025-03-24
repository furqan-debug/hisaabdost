
import { cn } from "@/lib/utils";

interface ReceiptPreviewImageProps {
  previewUrl: string | null;
  className?: string;
}

export function ReceiptPreviewImage({ 
  previewUrl, 
  className 
}: ReceiptPreviewImageProps) {
  if (!previewUrl) return null;
  
  return (
    <div className={cn("w-full flex justify-center", className)}>
      <img 
        src={previewUrl} 
        alt="Receipt preview" 
        className="max-h-52 rounded-md object-contain border bg-background" 
      />
    </div>
  );
}


import { Button } from "@/components/ui/button";

interface ReceiptPreviewProps {
  receiptUrl: string;
  onReplace: () => void;
}

export function ReceiptPreview({ receiptUrl, onReplace }: ReceiptPreviewProps) {
  if (!receiptUrl) return null;
  
  return (
    <div className="relative group">
      {receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
        <img
          src={receiptUrl}
          alt="Receipt preview"
          className="max-h-32 rounded-md border object-cover w-full"
        />
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


import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReceiptUploadOptionsProps {
  onUpload: () => void;
  onCapture: () => void;
  disabled?: boolean;
}

export function ReceiptUploadOptions({ onUpload, onCapture, disabled = false }: ReceiptUploadOptionsProps) {
  return (
    <Card className="p-4 bg-background/50 border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer backdrop-blur-md">
      <div className="flex flex-col items-center gap-3 py-3">
        <div className="flex gap-4 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onUpload}
            disabled={disabled}
            className="flex-1 bg-background/70"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Receipt
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCapture}
            disabled={disabled}
            className="flex-1 bg-background/70"
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          Upload or take a photo of your receipt for automatic expense entry
        </div>
      </div>
    </Card>
  );
}

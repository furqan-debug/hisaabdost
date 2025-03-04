
import { Button } from "@/components/ui/button";
import { Upload, Camera, ScanLine } from "lucide-react";

interface ReceiptActionsProps {
  onUpload: () => void;
  onCapture: () => void;
  onScan?: () => void;
  canScan: boolean;
  isScanning: boolean;
  receiptUrl: string;
}

export function ReceiptActions({ 
  onUpload, 
  onCapture, 
  onScan, 
  canScan, 
  isScanning,
  receiptUrl
}: ReceiptActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onUpload}
        className="w-full md:w-auto"
      >
        <Upload className="mr-2 h-4 w-4" />
        {receiptUrl ? 'Replace Receipt' : 'Upload Receipt'}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={onCapture}
        className="w-full md:w-auto"
      >
        <Camera className="mr-2 h-4 w-4" />
        Take Photo
      </Button>
      
      {canScan && onScan && (
        <Button
          type="button"
          variant="secondary"
          onClick={onScan}
          disabled={isScanning}
          className="w-full md:w-auto"
        >
          <ScanLine className="mr-2 h-4 w-4" />
          {isScanning ? 'Scanning...' : 'Scan Receipt'}
        </Button>
      )}
    </div>
  );
}

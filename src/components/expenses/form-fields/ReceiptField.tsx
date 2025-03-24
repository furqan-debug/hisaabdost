
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";

interface ReceiptFieldProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ReceiptField({ 
  receiptUrl, 
  onFileChange 
}: ReceiptFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-receipt">Receipt</Label>
      <div className="space-y-2">
        <ReceiptPreview 
          receiptUrl={receiptUrl} 
          onReplace={handleUpload} 
        />
        
        <Input
          id="expense-receipt"
          name="receipt"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleUpload}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {receiptUrl ? "Replace Receipt" : "Upload Receipt"}
        </Button>
      </div>
    </div>
  );
}

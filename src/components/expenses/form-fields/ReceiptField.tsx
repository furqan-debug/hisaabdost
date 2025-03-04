
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, ScanLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptFieldProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScanComplete?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
}

export function ReceiptField({ receiptUrl, onFileChange, onScanComplete }: ReceiptFieldProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanReceipt = async () => {
    const fileInput = document.getElementById('expense-receipt') as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      toast.error("Please upload a receipt image first");
      return;
    }

    setIsScanning(true);
    try {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('receipt', file);

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to scan receipt');
      }

      if (data.success && data.expenseDetails) {
        toast.success("Receipt scanned successfully!");
        if (onScanComplete) {
          onScanComplete(data.expenseDetails);
        }
      } else {
        toast.error(data.error || "Failed to extract information from receipt");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      toast.error("Receipt scanning failed. Please try again or enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-receipt">Receipt</Label>
      <div className="space-y-2">
        {receiptUrl && (
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
                onClick={() => document.getElementById('expense-receipt')?.click()}
              >
                Replace
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="expense-receipt"
            name="receipt"
            type="file"
            accept="image/*,.pdf"
            onChange={onFileChange}
            className="hidden"
            capture="environment"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('expense-receipt')?.click()}
            className="w-full md:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            {receiptUrl ? 'Replace Receipt' : 'Upload Receipt'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.getElementById('expense-receipt') as HTMLInputElement;
              if (input) {
                input.setAttribute('capture', 'environment');
                input.click();
              }
            }}
            className="w-full md:w-auto"
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
          
          {receiptUrl && receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i) && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleScanReceipt}
              disabled={isScanning}
              className="w-full md:w-auto"
            >
              <ScanLine className="mr-2 h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Scan Receipt'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

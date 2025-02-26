
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface ReceiptFieldProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ReceiptField({ receiptUrl, onFileChange }: ReceiptFieldProps) {
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
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('expense-receipt')?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {receiptUrl ? 'Replace Receipt' : 'Upload Receipt'}
          </Button>
        </div>
      </div>
    </div>
  );
}

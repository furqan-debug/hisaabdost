
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { parseReceiptText } from "@/utils/receiptParser";

export function ReceiptParserDemo() {
  const [ocrText, setOcrText] = useState("");
  const [parsedResult, setParsedResult] = useState<{ 
    merchant: string; 
    amount: string; 
    date: string;
  } | null>(null);

  const handleParse = () => {
    if (!ocrText.trim()) return;
    try {
      const result = parseReceiptText(ocrText);
      setParsedResult(result);
    } catch (error) {
      console.error("Error parsing receipt:", error);
    }
  };

  const handleClear = () => {
    setOcrText("");
    setParsedResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Receipt Parser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              OCR Text
            </label>
            <Textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="Paste OCR text extracted from receipt here..."
              className="font-mono h-48"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleParse} disabled={!ocrText.trim()}>
              Parse Receipt
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
          
          {parsedResult && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Parsed Result</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto font-mono">
                {JSON.stringify(parsedResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Extract merchant name, total amount, and date from receipt OCR text.
        </CardFooter>
      </Card>
    </div>
  );
}

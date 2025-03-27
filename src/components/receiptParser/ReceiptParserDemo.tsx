
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { processReceiptText } from "@/utils/receiptParser";
import { saveReceiptExtraction } from "@/services/receiptService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceiptHistory } from "./ReceiptHistory";
import { useAuth } from "@/lib/auth";

export function ReceiptParserDemo() {
  const { user } = useAuth();
  const [ocrText, setOcrText] = useState("");
  const [parsedResult, setParsedResult] = useState<{ 
    merchant: string; 
    items: Array<{name: string; amount: string}>;
    date: string;
    total: string;
  } | null>(null);

  const handleParse = () => {
    if (!ocrText.trim()) return;
    try {
      const result = processReceiptText(ocrText);
      setParsedResult(result);
    } catch (error) {
      console.error("Error parsing receipt:", error);
      toast.error("Failed to parse receipt text");
    }
  };

  const handleSaveToDatabase = async () => {
    if (!parsedResult) return;
    if (!user) {
      toast.error("You must be logged in to save receipts");
      return;
    }
    
    try {
      const receiptData = {
        merchant: parsedResult.merchant,
        date: parsedResult.date,
        total: parsedResult.total,
        items: parsedResult.items,
        receiptText: ocrText
      };
      
      const receiptId = await saveReceiptExtraction(receiptData);
      if (receiptId) {
        toast.success("Receipt saved to database");
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      toast.error("Failed to save receipt to database");
    }
  };

  const handleClear = () => {
    setOcrText("");
    setParsedResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Tabs defaultValue="parser">
        <TabsList className="mb-4">
          <TabsTrigger value="parser">Receipt Parser</TabsTrigger>
          <TabsTrigger value="history">Receipt History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parser">
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
                {parsedResult && user && (
                  <Button variant="secondary" onClick={handleSaveToDatabase}>
                    Save to Database
                  </Button>
                )}
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
              
              {parsedResult && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Parsed Result</h3>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <div className="mb-2">
                      <span className="font-semibold">Store:</span> {parsedResult.merchant}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Date:</span> {parsedResult.date}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Total:</span> ${parsedResult.total}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Items:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {parsedResult.items.map((item, index) => (
                        <li key={index}>
                          {item.name} - ${item.amount}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Extract store name, items with prices, and date from receipt OCR text.
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          {user ? (
            <ReceiptHistory />
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">Please log in to view your receipt history.</p>
                  <Button variant="secondary" asChild>
                    <a href="/auth">Log In</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

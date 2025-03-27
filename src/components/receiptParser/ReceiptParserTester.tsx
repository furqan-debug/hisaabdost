
import { useState } from "react";
import { processReceiptText } from "@/utils/receiptParser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export function ReceiptParserTester() {
  const [receiptText, setReceiptText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    if (!receiptText.trim()) {
      toast.warning("Please enter receipt text to parse");
      return;
    }

    setLoading(true);
    
    try {
      // Add a small delay to allow UI to update
      setTimeout(() => {
        const parsedResult = processReceiptText(receiptText);
        
        // Convert the result to ensure proper string formatting for display
        const formattedResult = {
          merchant: parsedResult.merchant,
          date: parsedResult.date,
          total: parsedResult.total.toString(),
          items: parsedResult.items.map(item => ({
            name: item.name,
            amount: item.amount.toString()
          }))
        };
        
        setResult(formattedResult);
        setLoading(false);
        
        if (formattedResult.items.length === 0) {
          toast.warning("No items could be extracted from the receipt text");
        } else {
          toast.success(`Successfully extracted ${formattedResult.items.length} items`);
        }
      }, 100);
    } catch (error) {
      console.error("Error parsing receipt:", error);
      setLoading(false);
      toast.error("Failed to parse receipt text");
    }
  };

  const handleClear = () => {
    setReceiptText("");
    setResult(null);
  };

  const sampleReceipt = `
GROCERY STORE
123 Main Street
San Francisco, CA 94103
Tel: (555) 123-4567
Date: 05/15/2023
Time: 14:32

RECEIPT #2023051500234

Apple                $2.99
Banana               $1.50
Milk 1 Gallon        $3.99
Bread                $2.50
Eggs (12)            $4.29

Subtotal            $15.27
Tax (8.5%)           $1.30
TOTAL               $16.57

VISA XXXX-1234      $16.57

Thank you for shopping with us!
  `;

  const handleLoadSample = () => {
    setReceiptText(sampleReceipt);
    setResult(null);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Receipt Parser Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Receipt Text</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoadSample}
            >
              Load Sample
            </Button>
          </div>
          <Textarea
            value={receiptText}
            onChange={(e) => setReceiptText(e.target.value)}
            placeholder="Paste receipt text here..."
            className="font-mono h-48"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleParse} 
            disabled={!receiptText.trim() || loading}
          >
            {loading ? "Parsing..." : "Parse Receipt"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Parse Results</h3>
            <div className="bg-muted p-4 rounded-md">
              <div className="mb-2">
                <span className="font-semibold">Merchant:</span> {result.merchant}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Date:</span> {result.date}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Total:</span> ${result.total}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Items:</span>
              </div>
              {result.items.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.items.map((item: any, index: number) => (
                    <li key={index}>
                      {item.name} - ${item.amount}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-500">No items found</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This tool parses receipt text to extract merchant name, items, prices, and date.
      </CardFooter>
    </Card>
  );
}

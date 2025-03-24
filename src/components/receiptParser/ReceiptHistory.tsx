
import { useState, useEffect } from "react";
import { getUserReceipts, deleteReceipt, getReceiptById } from "@/services/receiptService";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Eye, Receipt } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/chartUtils";
import { Skeleton } from "@/components/ui/skeleton";

export function ReceiptHistory() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptDetails, setReceiptDetails] = useState<{receipt: any, items: any[]} | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  async function loadReceipts() {
    setLoading(true);
    try {
      const data = await getUserReceipts(20);
      setReceipts(data || []);
    } catch (error) {
      console.error("Error loading receipts:", error);
      toast.error("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewReceipt(receiptId: string) {
    try {
      const details = await getReceiptById(receiptId);
      if (details) {
        setReceiptDetails(details);
        setShowDetailsDialog(true);
      } else {
        toast.error("Failed to load receipt details");
      }
    } catch (error) {
      console.error("Error viewing receipt:", error);
      toast.error("Failed to load receipt details");
    }
  }

  async function handleDeleteReceipt(receiptId: string) {
    if (confirm("Are you sure you want to delete this receipt?")) {
      try {
        const success = await deleteReceipt(receiptId);
        if (success) {
          toast.success("Receipt deleted successfully");
          setReceipts(receipts.filter(r => r.id !== receiptId));
        } else {
          toast.error("Failed to delete receipt");
        }
      } catch (error) {
        console.error("Error deleting receipt:", error);
        toast.error("Failed to delete receipt");
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            Receipt History
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No receipts found. Scan a receipt to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        {format(new Date(receipt.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{receipt.merchant}</TableCell>
                      <TableCell className="text-right">{formatCurrency(receipt.total)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewReceipt(receipt.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteReceipt(receipt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadReceipts}
            disabled={loading}
          >
            Refresh
          </Button>
        </CardFooter>
      </Card>
      
      {/* Receipt Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
            <DialogDescription>
              {receiptDetails?.receipt?.merchant} - {receiptDetails?.receipt?.date 
                ? format(new Date(receiptDetails.receipt.date), "MMMM dd, yyyy")
                : ""}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {receiptDetails?.receipt?.receipt_url && (
              <div className="w-full flex justify-center">
                <img 
                  src={receiptDetails.receipt.receipt_url} 
                  alt="Receipt" 
                  className="max-h-[300px] object-contain border rounded-md"
                />
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-2">Items</h4>
              {receiptDetails?.items && receiptDetails.items.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receiptDetails.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category || "Uncategorized"}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No items found for this receipt.</p>
              )}
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <span className="font-medium">Total</span>
              <span className="font-bold">{formatCurrency(receiptDetails?.receipt?.total || 0)}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

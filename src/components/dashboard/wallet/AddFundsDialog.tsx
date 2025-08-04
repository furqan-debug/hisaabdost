import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WalletAdditionInput } from "@/hooks/useWalletAdditions";
import { useCurrency } from "@/hooks/use-currency";
import { getCurrencyByCode } from "@/utils/currencyUtils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
interface AddFundsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFunds: (addition: WalletAdditionInput) => void;
  isAdding: boolean;
}
export function AddFundsDialog({
  isOpen,
  onClose,
  onAddFunds,
  isAdding
}: AddFundsDialogProps) {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());

  // Get currency code and then get the symbol from it
  const {
    currencyCode
  } = useCurrency();
  const currencySymbol = getCurrencyByCode(currencyCode).symbol;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }
    onAddFunds({
      amount: Number(amount),
      description: description || 'Added funds',
      date: format(date, 'yyyy-MM-dd')
    });

    // Reset form
    setAmount('');
    setDescription('');
    setDate(new Date());
  };

  // Reset form when dialog closes
  const handleClose = () => {
    setAmount('');
    setDescription('');
    setDate(new Date());
    onClose();
  };
  return <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
          <DialogDescription>
            Add funds manually to your wallet balance.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="pl-8" placeholder="0.00" step="0.01" min="0" required autoComplete="off" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={date => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this for?" rows={3} autoComplete="off" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isAdding} className="py-0 my-[5px]">
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !amount || Number(amount) <= 0} className="my-[6px] py-0">
              {isAdding ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
}
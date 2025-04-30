
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "PayPal",
  "Mobile Wallet",
  "Other"
];

interface PaymentMethodFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethodField({ value, onChange }: PaymentMethodFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="expense-payment">Payment Method</Label>
      <Select name="paymentMethod" value={value} onValueChange={onChange}>
        <SelectTrigger id="expense-payment" className="bg-background">
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent className="touch-scroll-container max-h-[40vh]">
          {PAYMENT_METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCurrencyReactive } from "@/hooks/useCurrencyReactive";

interface WalletBalanceCardProps {
  walletBalance: number;
}

export function WalletBalanceCard({ walletBalance }: WalletBalanceCardProps) {
  const { currencyCode, version } = useCurrencyReactive();
  
  return (
    <Card key={`wallet-balance-${version}`} className="relative overflow-hidden wallet-card">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Wallet className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xs font-medium text-muted-foreground">Wallet Balance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-lg font-bold text-foreground">
          {formatCurrency(walletBalance, currencyCode)}
        </div>
      </CardContent>
    </Card>
  );
}

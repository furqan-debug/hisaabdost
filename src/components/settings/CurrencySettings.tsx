
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { CURRENCY_OPTIONS, CurrencyCode } from "@/utils/currencyUtils";

export function CurrencySettings() {
  const { currencyCode, setCurrencyCode } = useCurrency();

  const handleCurrencyChange = (value: string) => {
    setCurrencyCode(value as CurrencyCode);
  };

  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Currency</h3>
      <Select value={currencyCode} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-full h-9">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>

        <SelectContent className="touch-scroll">
          {CURRENCY_OPTIONS.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              <div className="flex items-center">
                <span className="mr-2">{option.symbol}</span>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

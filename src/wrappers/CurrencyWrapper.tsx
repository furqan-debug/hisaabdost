
import { CurrencyProvider } from "@/hooks/use-currency-context";
import React from "react";

export function CurrencyWrapper({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}

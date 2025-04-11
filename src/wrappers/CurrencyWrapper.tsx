
import { CurrencyProvider } from "@/hooks/use-currency-context";
import React from "react";

// This component is no longer needed since we're directly using CurrencyProvider in App.tsx
export function CurrencyWrapper({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}

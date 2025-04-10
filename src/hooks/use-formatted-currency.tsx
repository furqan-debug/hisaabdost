
import { useCurrency } from "./use-currency";
import { formatCurrencyWithSymbol } from "@/utils/formatters";

/**
 * Hook that provides a function to format amounts with the currently selected currency
 */
export function useFormattedCurrency() {
  const { selectedCurrency } = useCurrency();

  /**
   * Format an amount using the currently selected currency
   * @param amount The amount to format
   * @returns Formatted amount with the current currency symbol
   */
  const format = (amount: number) => {
    return formatCurrencyWithSymbol(amount, selectedCurrency.symbol);
  };

  return { format, currencyCode: selectedCurrency.code, currencySymbol: selectedCurrency.symbol };
}

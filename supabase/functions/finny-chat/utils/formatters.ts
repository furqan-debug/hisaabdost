
export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  try {
    // Special handling for INR to support lakhs and crores notation
    if (currencyCode === 'INR') {
      if (amount >= 10000000) { // 1 crore = 10,000,000
        return `₹${(amount / 10000000).toFixed(2)} crore`;
      } else if (amount >= 100000) { // 1 lakh = 100,000
        return `₹${(amount / 100000).toFixed(2)} lakh`;
      }
    }
    
    // Special handling for PKR
    if (currencyCode === 'PKR') {
      return `Rs ${amount.toFixed(2)}`;
    }
    
    // Default currency formatting using Intl
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    // Fallback to USD if there's any error
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

// utils/format.ts

/**
 * Format a number as a currency string.
 * @param amount - The numeric value to format
 * @param currency - The currency code (default: 'NGN')
 * @param locale - The locale for formatting (default: 'en-NG')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'NGN',
  locale: string = 'en-NG'
): string {
  if (isNaN(amount)) return 'Invalid amount';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
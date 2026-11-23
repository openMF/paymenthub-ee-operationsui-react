/**
 * Formats an amount as Payment Hub returns it: in major units (10 is 10.00, not 0.10), keeping its
 * sign. A missing or non-numeric amount is shown as "-", not as 0. The currency, when the row has
 * one, follows the number.
 */
export function formatAmount(
  amount: number | string | null | undefined,
  currency?: string | null,
  locale?: string,
): string {
  if (amount === null || amount === undefined || amount === '') return '-'
  const n = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(n)) return '-'
  const text = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
  return currency ? `${text} ${currency}` : text
}

/** Decimal places shown when the currency is unknown or not given: most currencies have two. */
const DEFAULT_DIGITS = 2

/** The currency's own number of decimal places (USD 2, JPY 0, KWD 3), or 2 when it isn't known. */
export function currencyDigits(currency?: string | null): number {
  if (!currency) return DEFAULT_DIGITS
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? DEFAULT_DIGITS
  } catch {
    return DEFAULT_DIGITS // not an ISO 4217 code
  }
}

/**
 * Formats an amount as Payment Hub returns it: in major units (10 is 10.00, not 0.10), keeping its
 * sign, with the currency's decimal places (52.00 USD; two when the row has no currency, as batches
 * don't). A missing or non-numeric amount is shown as "-", not as 0. The currency, when the row has
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
  const digits = currencyDigits(currency)
  const text = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
  return currency ? `${text} ${currency}` : text
}

// PHEE-416: Payment Hub returns times as epoch milliseconds. The UI shows them in the browser's
// time zone, and names that zone in the column header: a time with no zone cannot be compared with
// the server logs or the database, which are in UTC.

/** The IANA name of the browser's time zone, e.g. "Australia/Adelaide" or "UTC". */
export function timeZoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time'
}

/** A column or field label with the time zone its times are shown in, e.g. "Start Time (UTC)". */
export function withTimeZone(label: string, timeZone: string = timeZoneName()): string {
  return `${label} (${timeZone})`
}

/** An epoch-millisecond time in the browser's time zone (or `timeZone`); '-' when there is none. */
export function formatTime(ms: number | null | undefined, timeZone?: string, locale?: string): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms) || ms <= 0) return '-'
  return new Date(ms).toLocaleString(locale, timeZone ? { timeZone } : undefined)
}

import { AlertCircle, Info } from 'lucide-react'
import { errorText } from '@/lib/errorText'

/** Shown when data could not be loaded. The screen shows no rows instead of invented ones. */
export default function LoadError({ what, error }: { what: string; error: unknown }) {
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
      <AlertCircle size={15} className="shrink-0" />
      Could not load {what}: {errorText(error)}
    </div>
  )
}

/**
 * Shown where a screen isn't connected to Payment Hub yet, instead of sample data. Some have no
 * backend at all; for others one exists but the UI doesn't call it yet (users, vouchers).
 */
export function NotAvailable({ what }: { what: string }) {
  return (
    <div role="status" className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
      <Info size={15} className="shrink-0" />
      {what} not available yet: this screen isn't connected to Payment Hub.
    </div>
  )
}

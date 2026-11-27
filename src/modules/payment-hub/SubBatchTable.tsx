import type { SubBatchSummary } from './types'
import StatusBadge from '@/components/shared/StatusBadge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatAmount } from '@/lib/formatAmount'
import { formatTime, withTimeZone } from '@/lib/formatTime'

const SKELETON_ROWS = 3

const count = (n: number | null) => (n ?? 0).toLocaleString()

/**
 * A batch's sub-batches: one row each, from GET /batches/{batchId}'s subBatchSummaryList.
 * `compact` (for a narrow card) shortens the ID (the full one on hover) and leaves out the start time
 * and the completed / failed breakdown.
 */
export default function SubBatchTable({
  subBatches,
  isLoading,
  emptyText,
  compact = false,
}: {
  subBatches: SubBatchSummary[]
  isLoading: boolean
  emptyText: string
  compact?: boolean
}) {
  const columns = compact ? 6 : 7
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sub-batch ID</TableHead>
          <TableHead>Payment Mode</TableHead>
          <TableHead>Payee FSP</TableHead>
          <TableHead className="text-right">Transactions</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          {!compact && <TableHead>{withTimeZone('Started')}</TableHead>}
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columns }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : subBatches.length > 0
            ? subBatches.map((s) => (
                <TableRow key={s.subBatchId}>
                  <TableCell className="font-medium">
                    {compact ? <span title={s.subBatchId}>{s.subBatchId.slice(0, 8)}…</span> : s.subBatchId}
                  </TableCell>
                  <TableCell>{s.modes ?? '-'}</TableCell>
                  <TableCell>{s.payeeFspSet?.length ? s.payeeFspSet.join(', ') : '-'}</TableCell>
                  <TableCell className="text-right">
                    {count(s.total)}
                    {!compact && (
                      <span className="text-xs text-muted-foreground">
                        {' '}({count(s.successful)} completed, {count(s.failed)} failed)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatAmount(s.totalAmount)}</TableCell>
                  {!compact && <TableCell>{formatTime(s.startedAt)}</TableCell>}
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                </TableRow>
              ))
            : (
                <TableRow>
                  <TableCell colSpan={columns} className="text-center text-muted-foreground py-8">
                    {emptyText}
                  </TableCell>
                </TableRow>
              )}
      </TableBody>
    </Table>
  )
}

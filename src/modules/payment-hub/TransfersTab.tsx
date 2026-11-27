import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTransfers } from '@/lib/api/paymentHub'
import type { Transfer } from './types'
import StatusBadge from '@/components/shared/StatusBadge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react'
import LoadError from '@/components/shared/LoadError'
import { exportCsv, csvDate } from '@/lib/exportCsv'
import { exportPdf } from '@/lib/exportPdf'
import { formatAmount } from '@/lib/formatAmount'
import { formatTime, withTimeZone } from '@/lib/formatTime'

const STATUSES = ['COMPLETED', 'IN_PROGRESS', 'FAILED']
const SKELETON_ROWS = 5


const formatField = (value: string | null) =>
  !value || value === 'null' ? '-' : value

export default function TransfersTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [payerFilter, setPayerFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data: apiData, isLoading, isError, error } = useQuery({
    queryKey: ['transfers'],
    queryFn: fetchTransfers,
  })

  const rows: Transfer[] = apiData?.content ?? []
  const totalCount: number = apiData?.totalElements ?? rows.length

  const payers = [...new Set(rows.map((t) => t.payerDfspId).filter((p): p is string => !!p && p !== 'null'))]

  const filtered = rows.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (payerFilter !== 'all' && t.payerDfspId !== payerFilter) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const exportRows: Record<string, unknown>[] = filtered.map((t) => ({
    'Transaction ID': t.transactionId,
    [withTimeZone('Start Time')]: formatTime(t.startedAt),
    [withTimeZone('Completed Time')]: formatTime(t.completedAt),
    'Batch ID': formatField(t.batchId),
    Amount: formatAmount(t.amount, t.currency),
    'Payer FSP': formatField(t.payerDfspId),
    Status: t.status ?? 'Unknown',
  }))

  return (
    <div className="space-y-4">
      {/* Filters + Export */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1) }}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#1565C0] text-white border-[#1565C0]'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-[#1565C0] text-white border-[#1565C0]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <Select value={payerFilter} onValueChange={(v) => { setPayerFilter(v); setPage(1) }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Payer FSP" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payers</SelectItem>
              {payers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={() => exportCsv(exportRows, `transfers-${csvDate()}.csv`)}
          >
            <Download size={13} /> Export CSV
          </Button>
          <Button
            variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={() => exportPdf(
              'Transfers',
              ['Transaction ID', withTimeZone('Start Time'), withTimeZone('Completed Time'), 'Batch ID', 'Amount', 'Payer FSP', 'Status'],
              filtered.map((t) => [t.transactionId, formatTime(t.startedAt), formatTime(t.completedAt), formatField(t.batchId), formatAmount(t.amount, t.currency), formatField(t.payerDfspId), t.status ?? 'Unknown']),
              `transfers-${csvDate()}.pdf`,
            )}
          >
            <FileText size={13} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {isError && <LoadError what="transfers" error={error} />}

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>{withTimeZone('Start Time')}</TableHead>
              <TableHead>{withTimeZone('Completed Time')}</TableHead>
              <TableHead>Batch ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payer FSP</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paginated.length > 0
                ? paginated.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.transactionId}</TableCell>
                      <TableCell>{formatTime(transfer.startedAt)}</TableCell>
                      <TableCell>{formatTime(transfer.completedAt)}</TableCell>
                      <TableCell>{formatField(transfer.batchId)}</TableCell>
                      <TableCell className="text-right">{formatAmount(transfer.amount, transfer.currency)}</TableCell>
                      <TableCell>{formatField(transfer.payerDfspId)}</TableCell>
                      <TableCell><StatusBadge status={transfer.status} /></TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {isError ? 'No transfers loaded.' : 'No records found.'}
                      </TableCell>
                    </TableRow>
                  )
            }
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Items per page</span>
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1) }}>
              <SelectTrigger className="w-17.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {filtered.length === 0
                ? '0–0 of 0'
                : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} of ${totalCount}`
              }
            </span>
            <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

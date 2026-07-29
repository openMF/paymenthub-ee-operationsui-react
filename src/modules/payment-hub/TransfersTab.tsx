import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTransfers } from '@/lib/api/paymentHub'
import { transfers as mockTransfers } from './mocks/transfers.mock'
import type { Transfer } from './types'
import StatusBadge from '@/components/shared/StatusBadge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Download, FileText, AlertCircle } from 'lucide-react'
import { exportCsv, csvDate } from '@/lib/exportCsv'
import { exportPdf } from '@/lib/exportPdf'

const STATUSES: Transfer['status'][] = ['Completed', 'Partially Authorized', 'Pending', 'Rejected']
const SKELETON_ROWS = 5

export default function TransfersTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [payerFilter, setPayerFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['transfers'],
    queryFn: fetchTransfers,
  })

  const rows: Transfer[] = (apiData?.content?.length ? apiData.content : mockTransfers)
  const totalCount: number = apiData?.totalElements ?? rows.length

  const payers = [...new Set(rows.map((t) => t.payerFSP))]

  const filtered = rows.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (payerFilter !== 'all' && t.payerFSP !== payerFilter) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const exportRows = filtered as unknown as Record<string, unknown>[]

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
              ['Transaction ID', 'Start Time', 'Completed Time', 'Source Ministry', 'Bulk Amount', 'Payer FSP', 'Status'],
              filtered.map((t) => [t.transactionId, t.startTime, t.completedTime || '—', t.sourceMinistry, t.bulkAmount.toLocaleString(), t.payerFSP, t.status]),
              `transfers-${csvDate()}.pdf`,
            )}
          >
            <FileText size={13} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
          <AlertCircle size={15} className="shrink-0" />
          Could not reach the API — showing cached data.
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Completed Time</TableHead>
              <TableHead>Source Ministry</TableHead>
              <TableHead className="text-right">Bulk Amount</TableHead>
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
                    <TableRow key={transfer.transactionId}>
                      <TableCell className="font-medium">{transfer.transactionId}</TableCell>
                      <TableCell>{transfer.startTime}</TableCell>
                      <TableCell>{transfer.completedTime || '—'}</TableCell>
                      <TableCell>{transfer.sourceMinistry}</TableCell>
                      <TableCell className="text-right">{transfer.bulkAmount.toLocaleString()}</TableCell>
                      <TableCell>{transfer.payerFSP}</TableCell>
                      <TableCell><StatusBadge status={transfer.status} /></TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No records found.
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

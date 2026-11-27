import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchMainBatches } from '@/lib/api/paymentHub'
import type { MainBatch } from './types'
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

const STATUSES = [
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Partially Authorized', value: 'IN_PROGRESS' },
  { label: 'Rejected', value: 'FAILED' },
]
const SKELETON_ROWS = 5

const formatInstitutionId = (id: string | null) =>
  !id || id === 'null' ? '-' : id

export default function MainBatchesTab() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data: apiData, isLoading, isError, error } = useQuery({
    queryKey: ['mainBatches'],
    queryFn: fetchMainBatches,
  })

  const rows: MainBatch[] = apiData?.data ?? []
  const totalCount: number = rows.length

  const filtered = rows.filter(
    (b) => statusFilter === 'all' || b.status === statusFilter
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const exportRows: Record<string, unknown>[] = filtered.map((b) => ({
    'Batch Reference': b.batchId,
    [withTimeZone('Start Time')]: formatTime(b.startedAt),
    [withTimeZone('Completed Time')]: formatTime(b.completedAt),
    'Institution ID': formatInstitutionId(b.registeringInstitutionId),
    Instructions: b.totalTransactions,
    Amount: formatAmount(b.totalAmount),
    'Payer FSP': b.payerFsp ?? '-',
    Status: b.status ?? 'Unknown',
  }))

  return (
    <div className="space-y-4">
      {/* Filters + Export */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
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
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPage(1) }}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                statusFilter === s.value
                  ? 'bg-[#1565C0] text-white border-[#1565C0]'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={() => exportCsv(exportRows, `main-batches-${csvDate()}.csv`)}
          >
            <Download size={13} /> Export CSV
          </Button>
          <Button
            variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={() => exportPdf(
              'Main Batches',
              ['Batch Reference', withTimeZone('Start Time'), withTimeZone('Completed Time'), 'Institution ID', 'Instructions', 'Amount', 'Payer FSP', 'Status'],
              filtered.map((b) => [b.batchId, formatTime(b.startedAt), formatTime(b.completedAt), formatInstitutionId(b.registeringInstitutionId), b.totalTransactions, formatAmount(b.totalAmount), b.payerFsp ?? '-', b.status ?? 'Unknown']),
              `main-batches-${csvDate()}.pdf`,
            )}
          >
            <FileText size={13} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {isError && <LoadError what="batches" error={error} />}

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Reference</TableHead>
              <TableHead>{withTimeZone('Start Time')}</TableHead>
              <TableHead>{withTimeZone('Completed Time')}</TableHead>
              <TableHead>Institution ID</TableHead>
              <TableHead className="text-right">Instructions</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payer FSP</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paginated.length > 0
                ? paginated.map((batch) => (
                    <TableRow
                      key={batch.batchId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/payment-hub/batch/${batch.batchId}`)}
                    >
                      <TableCell className="font-medium">{batch.batchId}</TableCell>
                      <TableCell>{formatTime(batch.startedAt)}</TableCell>
                      <TableCell>{formatTime(batch.completedAt)}</TableCell>
                      <TableCell>{formatInstitutionId(batch.registeringInstitutionId)}</TableCell>
                      <TableCell className="text-right">{batch.totalTransactions}</TableCell>
                      <TableCell className="text-right">{formatAmount(batch.totalAmount)}</TableCell>
                      <TableCell>{batch.payerFsp ?? '-'}</TableCell>
                      <TableCell><StatusBadge status={batch.status} /></TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {isError ? 'No batches loaded.' : 'No records found.'}
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

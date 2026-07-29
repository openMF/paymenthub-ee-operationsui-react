import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMainBatches } from '@/lib/api/paymentHub'
import { mainBatches as mockBatches } from './mocks/mainBatches.mock'
import type { MainBatch } from './types'
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

const STATUSES: MainBatch['status'][] = ['Completed', 'Partially Authorized', 'Rejected']
const SKELETON_ROWS = 5

export default function MainBatchesTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['mainBatches'],
    queryFn: fetchMainBatches,
  })

  // Fall back to mock data when API returns empty or errors
  const rows: MainBatch[] = (apiData?.data?.length ? apiData.data : mockBatches)
  const totalCount: number = apiData?.totalBatches ?? rows.length

  const filtered = rows.filter(
    (b) => statusFilter === 'all' || b.status === statusFilter
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const exportRows = filtered as unknown as Record<string, unknown>[]

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
              ['Batch Reference', 'Start Time', 'Completed Time', 'Institution ID', 'Source Ministry', 'Instructions', 'Amount', 'Payer FSP', 'Status'],
              filtered.map((b) => [b.batchReferenceNumber, b.startTime, b.completedTime, b.registeringInstitutionId, b.sourceMinistry, b.numberOfInstructions, b.amount.toLocaleString(), b.payerFSP, b.status]),
              `main-batches-${csvDate()}.pdf`,
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
              <TableHead>Batch Reference</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Completed Time</TableHead>
              <TableHead>Institution ID</TableHead>
              <TableHead>Source Ministry</TableHead>
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
                    {Array.from({ length: 9 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paginated.length > 0
                ? paginated.map((batch) => (
                    <TableRow key={batch.batchReferenceNumber}>
                      <TableCell className="font-medium">{batch.batchReferenceNumber}</TableCell>
                      <TableCell>{batch.startTime}</TableCell>
                      <TableCell>{batch.completedTime}</TableCell>
                      <TableCell>{batch.registeringInstitutionId}</TableCell>
                      <TableCell>{batch.sourceMinistry}</TableCell>
                      <TableCell className="text-right">{batch.numberOfInstructions}</TableCell>
                      <TableCell className="text-right">{batch.amount.toLocaleString()}</TableCell>
                      <TableCell>{batch.payerFSP}</TableCell>
                      <TableCell><StatusBadge status={batch.status} /></TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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

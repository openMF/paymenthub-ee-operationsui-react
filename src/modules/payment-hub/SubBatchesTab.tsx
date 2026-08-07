import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMainBatches, fetchSubBatches } from '@/lib/api/paymentHub'
import { mainBatches as mockBatches } from './mocks/mainBatches.mock'
import { subBatches as mockSubBatches } from './mocks/subBatches.mock'
import type { MainBatch, SubBatch } from './types'
import StatusBadge from '@/components/shared/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Download, FileText, AlertCircle } from 'lucide-react'
import { exportCsv, csvDate } from '@/lib/exportCsv'
import { exportPdf } from '@/lib/exportPdf'

const SKELETON_ROWS = 5

const formatAmount = (amount: number | null) => {
  if (!amount) return '0'
  return Math.abs(amount / 100).toLocaleString()
}

export default function SubBatchesTab() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data: mainBatchesData, isError: isBatchesError } = useQuery({
    queryKey: ['mainBatches'],
    queryFn: fetchMainBatches,
  })

  const batchOptions: MainBatch[] = isBatchesError ? mockBatches : (mainBatchesData?.data ?? [])
  const [batchId, setBatchId] = useState<string>('')

  useEffect(() => {
    if (!batchId && batchOptions.length > 0) {
      setBatchId(batchOptions[0].batchId)
    }
  }, [batchId, batchOptions])

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['subBatches', batchId],
    queryFn: () => fetchSubBatches(batchId),
    enabled: !!batchId,
  })

  const rows: SubBatch[] = isError
    ? mockSubBatches.filter((sb) => sb.batchId === batchId)
    : (apiData?.content ?? [])
  const totalCount: number = apiData?.totalElements ?? rows.length

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage))
  const paginated = rows.slice((page - 1) * perPage, page * perPage)

  const exportRows: Record<string, unknown>[] = rows.map((b) => ({
    'Sub Batch ID': b.subBatchId ?? '-',
    'Start Time': b.startedAt ? new Date(b.startedAt).toLocaleString() : '-',
    'Completed Time': b.completedAt ? new Date(b.completedAt).toLocaleString() : '-',
    'Total Transactions': b.totalTransactions,
    Completed: b.completed,
    Failed: b.failed,
    Amount: formatAmount(b.totalAmount),
    Status: b.status ?? 'Unknown',
  }))

  return (
    <div className="space-y-4">
      {/* Batch selector + Export */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Batch</span>
          <Select
            value={batchId}
            onValueChange={(v) => { setBatchId(v); setPage(1) }}
          >
            <SelectTrigger className="w-56"><SelectValue placeholder="Select a batch" /></SelectTrigger>
            <SelectContent>
              {batchOptions.map((b) => (
                <SelectItem key={b.batchId} value={b.batchId}>{b.batchId}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => exportCsv(exportRows, `sub-batches-${csvDate()}.csv`)}
          >
            <Download size={13} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => exportPdf(
              'Sub Batches',
              ['Sub Batch ID', 'Start Time', 'Completed Time', 'Total Transactions', 'Completed', 'Failed', 'Amount', 'Status'],
              rows.map((b) => [b.subBatchId ?? '-', b.startedAt ? new Date(b.startedAt).toLocaleString() : '-', b.completedAt ? new Date(b.completedAt).toLocaleString() : '-', b.totalTransactions, b.completed, b.failed, formatAmount(b.totalAmount), b.status ?? 'Unknown']),
              `sub-batches-${csvDate()}.pdf`,
            )}
          >
            <FileText size={13} />
            Export PDF
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
              <TableHead>Sub Batch ID</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Completed Time</TableHead>
              <TableHead className="text-right">Total Transactions</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead className="text-right">Amount</TableHead>
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
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.subBatchId ?? '-'}</TableCell>
                      <TableCell>{batch.startedAt ? new Date(batch.startedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell>{batch.completedAt ? new Date(batch.completedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell className="text-right">{batch.totalTransactions}</TableCell>
                      <TableCell className="text-right">{batch.completed}</TableCell>
                      <TableCell className="text-right">{batch.failed}</TableCell>
                      <TableCell className="text-right">{formatAmount(batch.totalAmount)}</TableCell>
                      <TableCell><StatusBadge status={batch.status} /></TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                setPerPage(Number(v))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-17.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {rows.length === 0
                ? '0–0 of 0'
                : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, rows.length)} of ${totalCount}`
              }
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

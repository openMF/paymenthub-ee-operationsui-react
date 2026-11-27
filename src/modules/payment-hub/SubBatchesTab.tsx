import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchMainBatches, fetchBatchSummary } from '@/lib/api/paymentHub'
import type { MainBatch, SubBatchSummary } from './types'
import SubBatchTable from './SubBatchTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import LoadError from '@/components/shared/LoadError'
import { exportCsv, csvDate } from '@/lib/exportCsv'
import { exportPdf } from '@/lib/exportPdf'
import { formatAmount } from '@/lib/formatAmount'
import { formatTime } from '@/lib/formatTime'

// A batch's sub-batches (GET /batches/{batchId}). This tab used to list the chosen batch's
// transactions from GET /batch/transactions, which is empty for Mojaloop batches: their transfers
// are stored under the sub-batch's ID (PHEE-468). The batch's transfers are on its Batch Detail page.
export default function SubBatchesTab() {
  const navigate = useNavigate()
  const { data: mainBatchesData, isError: isBatchesError, error: batchesError } = useQuery({
    queryKey: ['mainBatches'],
    queryFn: fetchMainBatches,
  })

  const batchOptions: MainBatch[] = mainBatchesData?.data ?? []
  const [chosen, setChosen] = useState<string>('')
  // Until one is picked, the newest batch (the BFF lists newest first).
  const batchId = chosen || batchOptions[0]?.batchId || ''

  const { data: summary, isLoading, isError, error } = useQuery({
    queryKey: ['batchSummary', batchId],
    queryFn: () => fetchBatchSummary(batchId),
    enabled: !!batchId,
  })

  const rows: SubBatchSummary[] = summary?.subBatchSummaryList ?? []

  const exportHeaders = ['Sub-batch ID', 'Payment Mode', 'Payee FSP', 'Transactions', 'Completed', 'Failed', 'Amount', 'Started', 'Status']
  const exportCells = (s: SubBatchSummary) => [
    s.subBatchId, s.modes ?? '', s.payeeFspSet?.join(' ') ?? '', s.total ?? 0, s.successful ?? 0, s.failed ?? 0,
    formatAmount(s.totalAmount), formatTime(s.startedAt), s.status ?? '',
  ]

  return (
    <div className="space-y-4">
      {/* Batch selector + Export */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Batch</span>
          <Select value={batchId} onValueChange={setChosen}>
            <SelectTrigger className="w-80"><SelectValue placeholder="Select a batch" /></SelectTrigger>
            <SelectContent>
              {batchOptions.map((b) => (
                <SelectItem key={b.batchId} value={b.batchId}>{b.batchId}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {batchId && (
            <Button variant="link" size="sm" className="text-xs" onClick={() => navigate(`/payment-hub/batch/${batchId}`)}>
              View the batch's transactions
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={rows.length === 0}
            onClick={() => exportCsv(
              rows.map((s) => Object.fromEntries(exportHeaders.map((h, i) => [h, exportCells(s).at(i)]))),
              `sub-batches-${csvDate()}.csv`,
            )}
          >
            <Download size={13} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={rows.length === 0}
            onClick={() => exportPdf('Sub-batches', exportHeaders, rows.map(exportCells), `sub-batches-${csvDate()}.pdf`)}
          >
            <FileText size={13} />
            Export PDF
          </Button>
        </div>
      </div>

      {isBatchesError && <LoadError what="batches" error={batchesError} />}
      {isError && <LoadError what="the batch's sub-batches" error={error} />}

      <div className="rounded-lg border bg-white">
        <SubBatchTable
          subBatches={rows}
          isLoading={isLoading && !!batchId}
          emptyText={isError || isBatchesError ? 'No sub-batches loaded.' : 'This batch has no sub-batches.'}
        />
      </div>
    </div>
  )
}

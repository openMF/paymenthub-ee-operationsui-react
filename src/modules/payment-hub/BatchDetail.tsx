import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchMainBatches, fetchBatchTransactions } from '@/lib/api/paymentHub'
import { mainBatches as mockBatches } from './mocks/mainBatches.mock'
import { batchTransactionsByBatch } from './mocks/batchTransactions.mock'
import type { BatchTransaction } from './types'
import StatusBadge from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

const SKELETON_ROWS = 5

const formatAmount = (amount: number | null) => {
  if (!amount) return '0'
  return Math.abs(amount / 100).toLocaleString()
}

const formatDate = (ts: number | null) => (ts ? new Date(ts).toLocaleString() : '-')

const formatField = (value: string | null | undefined) =>
  !value || value === 'null' ? '-' : value

function toRows(data: Record<string, string>): BatchTransaction[] {
  return Object.entries(data).map(([transactionId, status]) => ({ transactionId, status }))
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <span className="text-3xl font-bold text-gray-800">{value}</span>
      </CardContent>
    </Card>
  )
}

export default function BatchDetail() {
  const { batchId } = useParams()
  const navigate = useNavigate()

  const { data: batchData, isError: isBatchesError } = useQuery({
    queryKey: ['mainBatches'],
    queryFn: fetchMainBatches,
  })

  const batches = isBatchesError ? mockBatches : (batchData?.data ?? [])
  const batch = batches.find((b) => b.batchId === batchId)

  const { data: transactionsData, isLoading: isTransactionsLoading, isError: isTransactionsError } = useQuery({
    queryKey: ['batchTransactions', batchId],
    queryFn: () => fetchBatchTransactions(batchId!),
    enabled: !!batchId,
  })

  const transactions: BatchTransaction[] = isTransactionsError
    ? toRows(batchTransactionsByBatch[batchId ?? ''] ?? {})
    : toRows(transactionsData ?? {})

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/payment-hub" className="hover:text-foreground transition-colors">
          Payment Hub
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Batch Detail</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={() => navigate('/payment-hub')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{batchId}</h1>
        <StatusBadge status={batch?.status ?? null} />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Transactions" value={batch?.totalTransactions ?? 0} />
        <StatCard label="Completed" value={batch?.completed ?? 0} />
        <StatCard label="Failed" value={batch?.failed ?? 0} />
        <StatCard label="Total Amount" value={formatAmount(batch?.totalAmount ?? null)} />
      </div>

      {/* Batch info + Transactions */}
      <div className="flex gap-4 items-start">
        {/* Batch Info */}
        <Card className="flex-1 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Batch Info</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Batch ID" value={formatField(batch?.batchId)} />
            <InfoRow label="Payer FSP" value={formatField(batch?.payerFsp)} />
            <InfoRow label="Started At" value={formatDate(batch?.startedAt ?? null)} />
            <InfoRow label="Completed At" value={formatDate(batch?.completedAt ?? null)} />
            <InfoRow label="Correlation ID" value={formatField(batch?.correlationId)} />
            <InfoRow label="Registering Institution ID" value={formatField(batch?.registeringInstitutionId)} />
          </CardContent>
        </Card>

        {/* Batch Transactions */}
        <Card className="flex-2 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isTransactionsError && (
              <div className="px-6 pb-3 text-xs text-orange-700">
                Could not reach the API — showing cached data.
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTransactionsLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 2 }).map((__, j) => (
                          <TableCell key={j}>
                            <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : transactions.length > 0
                    ? transactions.map((t) => (
                        <TableRow key={t.transactionId}>
                          <TableCell className="font-medium">{t.transactionId}</TableCell>
                          <TableCell><StatusBadge status={t.status} /></TableCell>
                        </TableRow>
                      ))
                    : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      )
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

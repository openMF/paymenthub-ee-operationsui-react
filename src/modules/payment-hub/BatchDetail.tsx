import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchMainBatches, fetchSubBatches } from '@/lib/api/paymentHub'
import { mainBatches as mockBatches } from './mocks/mainBatches.mock'
import { subBatches as mockSubBatches } from './mocks/subBatches.mock'
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

  const { data: subBatchData, isLoading: isSubBatchesLoading, isError: isSubBatchesError } = useQuery({
    queryKey: ['subBatches', batchId],
    queryFn: () => fetchSubBatches(batchId!),
    enabled: !!batchId,
  })

  const subBatches = isSubBatchesError
    ? mockSubBatches.filter((sb) => sb.batchId === batchId)
    : (subBatchData?.content ?? [])

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

      {/* Batch info + Sub batches */}
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

        {/* Sub Batches */}
        <Card className="flex-2 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Sub Batches</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isSubBatchesError && (
              <div className="px-6 pb-3 text-xs text-orange-700">
                Could not reach the API — showing cached data.
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub Batch ID</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isSubBatchesLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : subBatches.length > 0
                    ? subBatches.map((sb) => (
                        <TableRow key={sb.id}>
                          <TableCell className="font-medium">{sb.subBatchId ?? '-'}</TableCell>
                          <TableCell className="text-right">{sb.totalTransactions}</TableCell>
                          <TableCell className="text-right">{sb.completed}</TableCell>
                          <TableCell className="text-right">{sb.failed}</TableCell>
                          <TableCell className="text-right">{formatAmount(sb.totalAmount)}</TableCell>
                          <TableCell><StatusBadge status={sb.status} /></TableCell>
                        </TableRow>
                      ))
                    : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No sub batches found.
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

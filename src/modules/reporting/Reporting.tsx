import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import StatusBadge from '@/components/shared/StatusBadge'
import { fetchMainBatches, fetchTransfers } from '@/lib/api/paymentHub'
import { mainBatches as mockBatches } from '@/modules/payment-hub/mocks/mainBatches.mock'
import { transfers as mockTransfers } from '@/modules/payment-hub/mocks/transfers.mock'
import type { MainBatch } from '@/modules/payment-hub/types'

// ── Mock data (fallback for charts with no real endpoint yet) ──────────────

const ministryData = [
  { ministry: 'Finance',    amount: 560 },
  { ministry: 'Health',     amount: 320 },
  { ministry: 'Education',  amount: 410 },
  { ministry: 'Agriculture',amount: 190 },
  { ministry: 'Transport',  amount: 280 },
  { ministry: 'Rural Dev',  amount: 230 },
]

const dfspData = [
  { dfsp: 'GreenBank', rate: 8.2 },
  { dfsp: 'BlueBank',  rate: 14.7 },
  { dfsp: 'RedBank',   rate: 19.3 },
  { dfsp: 'HDFC',      rate: 6.1 },
  { dfsp: 'SBI',       rate: 11.5 },
]

const TENANTS = ['greenbank', 'bluebank', 'redbank']

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#22c55e',
  IN_PROGRESS: '#f97316',
  FAILED: '#ef4444',
}

const formatAmount = (amount: number | null) => {
  if (!amount) return '0'
  return Math.abs(amount / 100).toLocaleString()
}

function buildStatusBreakdown(batches: MainBatch[]) {
  const total = batches.length
  if (total === 0) return []
  const counts: Record<string, number> = { COMPLETED: 0, IN_PROGRESS: 0, FAILED: 0 }
  for (const b of batches) {
    if (b.status && b.status in counts) counts[b.status] += 1
  }
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: Number(((count / total) * 100).toFixed(1)),
      color: STATUS_COLORS[status],
    }))
}

function buildVolumeData(transfers: { startedAt: number | null }[]) {
  const counts = new Map<string, number>()
  for (const t of transfers) {
    if (!t.startedAt) continue
    const key = new Date(t.startedAt).toISOString().slice(0, 10)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count,
    }))
}

// ── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, trend, isLoading }: { label: string; value: string; trend: 'up' | 'down'; isLoading?: boolean }) {
  const isUp = trend === 'up'
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <div className="flex items-end gap-1.5">
          {isLoading ? (
            <div className="h-8 w-20 rounded bg-gray-100 animate-pulse" />
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-800">{value}</span>
              {isUp
                ? <TrendingUp size={15} className="text-emerald-500 mb-1.5" />
                : <TrendingDown size={15} className="text-red-500 mb-1.5" />}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Reporting() {
  const [fromDate, setFromDate] = useState('2026-07-17')
  const [toDate, setToDate]     = useState('2026-07-23')
  const [tenant, setTenant]     = useState('all')

  const { data: batchData, isLoading: isBatchesLoading, isError: isBatchesError } = useQuery({
    queryKey: ['mainBatches'],
    queryFn: fetchMainBatches,
  })

  const { data: transferData, isError: isTransfersError } = useQuery({
    queryKey: ['transfers'],
    queryFn: fetchTransfers,
  })

  const batches: MainBatch[] = isBatchesError ? mockBatches : (batchData?.data ?? [])
  const transfers = isTransfersError ? mockTransfers : (transferData?.content ?? [])

  const totalBatches = batches.length
  const totalTransactions = batches.reduce((sum, b) => sum + b.totalTransactions, 0)
  const totalAmount = formatAmount(batches.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0))
  const completedBatches = batches.filter((b) => b.status === 'COMPLETED').length
  const failedBatchCount = batches.filter((b) => b.status === 'FAILED').length
  const successRate = totalBatches > 0 ? ((completedBatches / totalBatches) * 100).toFixed(1) : '0.0'
  const failureRate = totalBatches > 0 ? ((failedBatchCount / totalBatches) * 100).toFixed(1) : '0.0'

  const pieData = buildStatusBreakdown(batches)
  const volumeData = buildVolumeData(transfers)
  const failedBatches = batches.filter((b) => b.status === 'FAILED')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Reporting Dashboard</h1>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-1.5">
              <Label htmlFor="fromDate">From Date</Label>
              <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="toDate">To Date</Label>
              <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tenant-filter">Tenant</Label>
              <Select value={tenant} onValueChange={setTenant}>
                <SelectTrigger id="tenant-filter" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {TENANTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-[#1565C0] hover:bg-[#0d47a1] text-white">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Row 1 — KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Transactions" value={totalTransactions.toLocaleString()} trend="up" isLoading={isBatchesLoading} />
        <KpiCard label="Total Amount Disbursed" value={`$${totalAmount}`} trend="up" isLoading={isBatchesLoading} />
        <KpiCard label="Success Rate" value={`${successRate}%`} trend="up" isLoading={isBatchesLoading} />
        <KpiCard label="Failure Rate" value={`${failureRate}%`} trend="down" isLoading={isBatchesLoading} />
      </div>

      {/* Row 2 — Line + Pie */}
      <div className="flex gap-4">
        {/* Transaction Volume Over Time */}
        <Card className="flex-3 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Transaction Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={volumeData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="count" stroke="#1565C0" strokeWidth={2} dot={false} name="Transfers" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Batch Status Breakdown */}
        <Card className="flex-2 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Batch Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 mt-2 w-full px-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Bar charts */}
      <div className="flex gap-4">
        {/* Amount by Ministry */}
        <Card className="flex-1 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Amount Disbursed by Ministry ($K)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ministryData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ministry" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${v}K`} />
                <Bar dataKey="amount" fill="#1565C0" radius={[3, 3, 0, 0]} name="Amount ($K)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Failure Rate by DFSP */}
        <Card className="flex-1 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Failure Rate by DFSP (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dfspData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dfsp" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="#ef4444" radius={[3, 3, 0, 0]} name="Failure Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4 — Failed batches table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-800">Recent Failed Batches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100">
                <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Batch Reference</th>
                <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Start Time</th>
                <th className="text-right px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {failedBatches.length > 0
                ? failedBatches.map((b) => (
                    <tr key={b.batchId} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-gray-700">{b.batchId}</td>
                      <td className="px-6 py-3 text-gray-600">{b.startedAt ? new Date(b.startedAt).toLocaleString() : '-'}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-700">{formatAmount(b.totalAmount)}</td>
                      <td className="px-6 py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted-foreground py-8">
                        No failed batches.
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

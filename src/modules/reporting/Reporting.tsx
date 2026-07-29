import { useState } from 'react'
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

// ── Mock data ──────────────────────────────────────────────────────────────

const volumeData = [
  { date: 'Jul 17', completed: 142, failed: 18 },
  { date: 'Jul 18', completed: 189, failed: 24 },
  { date: 'Jul 19', completed: 97,  failed: 31 },
  { date: 'Jul 20', completed: 213, failed: 15 },
  { date: 'Jul 21', completed: 176, failed: 22 },
  { date: 'Jul 22', completed: 234, failed: 29 },
  { date: 'Jul 23', completed: 196, failed: 20 },
]

const pieData = [
  { name: 'Completed',            value: 62, color: '#22c55e' },
  { name: 'Partially Authorized', value: 28, color: '#f97316' },
  { name: 'Rejected',             value: 10, color: '#ef4444' },
]

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

const failedBatches = [
  { ref: 'BATCH-004-2026', ministry: 'Ministry of Agriculture', amount: '$780K',  reason: 'Insufficient funds',       status: 'Rejected' },
  { ref: 'BATCH-008-2026', ministry: 'Ministry of Education',   amount: '$4.2M',  reason: 'Invalid account numbers',  status: 'Rejected' },
  { ref: 'BATCH-011-2026', ministry: 'Ministry of Transport',   amount: '$1.1M',  reason: 'Compliance check failed',  status: 'Rejected' },
  { ref: 'BATCH-015-2026', ministry: 'Ministry of Health',      amount: '$650K',  reason: 'Duplicate batch detected', status: 'Rejected' },
  { ref: 'BATCH-019-2026', ministry: 'Ministry of Finance',     amount: '$2.3M',  reason: 'Timeout — payer FSP',      status: 'Rejected' },
]

const TENANTS = ['greenbank', 'bluebank', 'redbank']

// ── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, trend }: { label: string; value: string; trend: 'up' | 'down' }) {
  const isUp = trend === 'up'
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <div className="flex items-end gap-1.5">
          <span className="text-3xl font-bold text-gray-800">{value}</span>
          {isUp
            ? <TrendingUp size={15} className="text-emerald-500 mb-1.5" />
            : <TrendingDown size={15} className="text-red-500 mb-1.5" />}
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
        <KpiCard label="Total Transactions"    value="1,247"  trend="up" />
        <KpiCard label="Total Amount Disbursed" value="$4.2M" trend="up" />
        <KpiCard label="Success Rate"          value="87.3%"  trend="up" />
        <KpiCard label="Failure Rate"          value="12.7%"  trend="down" />
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
                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={false} name="Completed" />
                <Line type="monotone" dataKey="failed"    stroke="#ef4444" strokeWidth={2} dot={false} name="Failed" />
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
                <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Ministry</th>
                <th className="text-right px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Failure Reason</th>
                <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {failedBatches.map((b) => (
                <tr key={b.ref} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-gray-700">{b.ref}</td>
                  <td className="px-6 py-3 text-gray-600">{b.ministry}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-700">{b.amount}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{b.reason}</td>
                  <td className="px-6 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

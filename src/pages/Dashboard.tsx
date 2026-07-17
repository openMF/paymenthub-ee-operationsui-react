import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Landmark, Ticket, Users, SlidersHorizontal, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/shared/StatusBadge'
import { mainBatches } from '@/modules/payment-hub/mocks/mainBatches.mock'
import { vouchers } from '@/modules/vouchers/mocks/vouchers.mock'
import { g2pConfigs } from '@/modules/g2p-config/mocks/g2pConfigs.mock'
import { mockUsers } from '@/modules/rbac/mocks/users.mock'

const activeG2P = g2pConfigs.filter((c) => c.status === 'Active').length
const recentBatches = mainBatches.slice(0, 5)
const recentVouchers = vouchers.slice(0, 5)

function formatAmount(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

      {/* Row 1 — Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Batches"
          value={mainBatches.length}
          subtitle="Payment Hub"
          icon={<Landmark size={20} className="text-white" />}
          iconBg="bg-[#1565C0]"
          trend="up"
        />
        <StatCard
          label="Total Vouchers"
          value={vouchers.length}
          subtitle="Voucher Management"
          icon={<Ticket size={20} className="text-white" />}
          iconBg="bg-emerald-500"
          trend="up"
        />
        <StatCard
          label="Total Beneficiaries"
          value={mockUsers.length}
          subtitle="Account Mapper"
          icon={<Users size={20} className="text-white" />}
          iconBg="bg-orange-500"
          trend="up"
        />
        <StatCard
          label="Active G2P Configs"
          value={activeG2P}
          subtitle="G2P Payment Config"
          icon={<SlidersHorizontal size={20} className="text-white" />}
          iconBg="bg-purple-500"
          dot
        />
      </div>

      {/* Row 2 — Tables */}
      <div className="flex gap-4">
        {/* Recent Batches (60%) */}
        <Card className="flex-3 min-w-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">Recent Batches</CardTitle>
              <Link to="/payment-hub" className="text-xs text-[#1565C0] hover:underline font-medium">
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100">
                  <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Batch Reference</th>
                  <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Source Ministry</th>
                  <th className="text-right px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((b) => (
                  <tr key={b.batchReferenceNumber} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-700">{b.batchReferenceNumber}</td>
                    <td className="px-6 py-3 text-gray-600">{b.sourceMinistry}</td>
                    <td className="px-6 py-3 text-right text-gray-700 font-medium">{formatAmount(b.amount)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent Vouchers (40%) */}
        <Card className="flex-2 min-w-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">Recent Vouchers</CardTitle>
              <Link to="/vouchers" className="text-xs text-[#1565C0] hover:underline font-medium">
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul>
              {recentVouchers.map((v, i) => (
                <li
                  key={v.serialNumber}
                  className={[
                    'flex items-center justify-between px-6 py-3 gap-3',
                    i !== 0 ? 'border-t border-gray-50' : '',
                    'hover:bg-gray-50 transition-colors',
                  ].join(' ')}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-gray-700 truncate">{v.serialNumber}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{v.governmentEntity}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/payment-hub')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1565C0] hover:bg-[#0d47a1] text-white text-sm font-medium transition-colors"
          >
            <Landmark size={15} />
            Upload Batch
          </button>
          <button
            type="button"
            onClick={() => navigate('/vouchers')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            <Ticket size={15} />
            Create Voucher
          </button>
          <button
            type="button"
            onClick={() => navigate('/account-mapper')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
          >
            <UserPlus size={15} />
            Add Beneficiary
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconBg,
  trend,
  dot,
}: {
  label: string
  value: number
  subtitle: string
  icon: React.ReactNode
  iconBg: string
  trend?: 'up'
  dot?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-bold text-gray-800">{value}</span>
              {trend === 'up' && (
                <TrendingUp size={15} className="text-emerald-500 mb-1.5" />
              )}
              {dot && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 mb-2.5 inline-block" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

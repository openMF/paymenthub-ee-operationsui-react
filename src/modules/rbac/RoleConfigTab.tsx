import { Check, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MODULES = [
  'Payment Hub',
  'Vouchers',
  'Account Mapper',
  'G2P Config',
  'Settings',
]

type Access = 'full' | 'partial' | 'readonly'

interface RoleCard {
  role: string
  badge: string
  badgeClass: string
  access: Access
  allowed: boolean[]
}

const ROLES: RoleCard[] = [
  {
    role: 'Admin',
    badge: 'Full Access',
    badgeClass: 'bg-green-100 text-green-700',
    access: 'full',
    allowed: [true, true, true, true, true],
  },
  {
    role: 'Operator',
    badge: 'Limited Access',
    badgeClass: 'bg-blue-100 text-blue-700',
    access: 'partial',
    allowed: [true, true, false, false, false],
  },
  {
    role: 'Auditor',
    badge: 'Read Only',
    badgeClass: 'bg-gray-100 text-gray-600',
    access: 'readonly',
    allowed: [true, true, true, true, true],
  },
]

function ModuleRow({
  name,
  allowed,
  access,
}: {
  name: string
  allowed: boolean
  access: Access
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-gray-700">{name}</span>
      {access === 'readonly' ? (
        <Eye className="h-4 w-4 text-gray-500" />
      ) : allowed ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-red-400" />
      )}
    </div>
  )
}

export default function RoleConfigTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ROLES.map((r) => (
        <div
          key={r.role}
          className="flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="px-5 pt-5 pb-4 border-b">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-900">{r.role}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.badgeClass}`}
              >
                {r.badge}
              </span>
            </div>
          </div>

          {/* Module list */}
          <div className="flex-1 px-5 py-2">
            {MODULES.map((mod, i) => (
              <ModuleRow
                key={mod}
                name={mod}
                allowed={r.allowed[i]}
                access={r.access}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t bg-gray-50">
            <Button variant="outline" className="w-full text-sm">
              Edit Permissions
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

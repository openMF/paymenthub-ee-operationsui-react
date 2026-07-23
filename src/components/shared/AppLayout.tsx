import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  BarChart2,
  Bell,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Landmark,
  LogOut,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Ticket,
  User,
  Users,
} from 'lucide-react'
import { APP_NAME, DEFAULT_TENANT, TENANTS } from '@/config/constants'
import { useAuth } from '@/lib/keycloak/useAuth'

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  exact?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard',         path: '/',              icon: LayoutDashboard, exact: true },
  { label: 'Payment Hub',       path: '/payment-hub',   icon: Landmark },
  { label: 'Vouchers',          path: '/vouchers',      icon: Ticket },
  { label: 'Account Mapper',    path: '/account-mapper',icon: ArrowLeftRight },
  { label: 'Visualizations',    path: '/reporting',     icon: BarChart2 },
  { label: 'G2P Payment Config',path: '/g2p-config',    icon: SlidersHorizontal },
  { label: 'Users',             path: '/rbac',          icon: Users },
  { label: 'Roles & Permissions',path: '/rbac',         icon: Shield },
  { label: 'Audit Trails',      path: '/audit',         icon: ClipboardList },
  { label: 'Settings',          path: '/settings',      icon: Settings },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tenant, setTenant] = useState(
    localStorage.getItem('tenant') ?? DEFAULT_TENANT
  )
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  function handleTenantChange(value: string) {
    setTenant(value)
    localStorage.setItem('tenant', value)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function isActive(item: NavItem) {
    return item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
  }

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col bg-white border-r border-gray-200 shrink-0">
        {/* Logo area */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-center">
          <img
            src="/payment-hub-ee.png"
            alt={APP_NAME}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <Link
                key={`${item.label}-${item.path}`}
                to={item.path}
                className={[
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors relative',
                  active
                    ? 'bg-blue-50 text-[#1565C0] border-l-4 border-[#1565C0]'
                    : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent',
                ].join(' ')}
              >
                <Icon size={16} className={active ? 'text-[#1565C0]' : 'text-gray-400'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Back button */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-3 shrink-0">
          <select
            aria-label="Language"
            className="text-sm border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>

          <select
            aria-label="Tenant"
            className="text-sm border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white"
            value={tenant}
            onChange={(e) => handleTenantChange(e.target.value)}
          >
            {TENANTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button type="button" aria-label="Notifications" className="p-1 text-gray-400 hover:text-gray-600">
            <Bell size={18} />
          </button>
          <button type="button" aria-label="Search" className="p-1 text-gray-400 hover:text-gray-600">
            <Search size={18} />
          </button>
          <button type="button" aria-label="Help" className="p-1 text-gray-400 hover:text-gray-600">
            <HelpCircle size={18} />
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              type="button"
              aria-label="User menu"
              onClick={() => setAvatarOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1565C0]"
            >
              <div className="w-8 h-8 rounded-full bg-[#1565C0] flex items-center justify-center">
                <User size={15} className="text-white" />
              </div>
              {user?.name && (
                <span className="text-sm text-gray-700 font-medium max-w-28 truncate hidden lg:block">
                  {user.name}
                </span>
              )}
            </button>

            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                {user && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setAvatarOpen(false); logout() }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-[#F5F7FA]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

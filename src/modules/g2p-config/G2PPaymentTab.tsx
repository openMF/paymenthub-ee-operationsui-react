import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchG2PConfigs } from '@/lib/api/g2pConfig'
import { g2pConfigs as mockConfigs } from './mocks/g2pConfigs.mock'
import type { G2PConfig } from './types'
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
import { ChevronLeft, ChevronRight } from 'lucide-react'

const filterChips = [
  'Government Entity',
  'Program',
  'Payer DFSP',
  'Payment Account',
  'Status',
] as const

type FilterChip = (typeof filterChips)[number]

const statuses: G2PConfig['status'][] = ['Active', 'Inactive']

const SKELETON_ROWS = 5

export default function G2PPaymentTab() {
  const [activeChip, setActiveChip] = useState<FilterChip | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['g2pConfigs'],
    queryFn: fetchG2PConfigs,
    retry: false,
  })

  // Silently fall back to mock data if the API is unreachable (e.g. G2P
  // service not deployed yet) — no error banner shown to the user.
  const rows: G2PConfig[] = isError ? mockConfigs : (apiData ?? [])

  const filtered = rows.filter(
    (c) => statusFilter === 'all' || c.status === statusFilter
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setActiveChip(null)
            setStatusFilter('all')
            setPage(1)
          }}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            activeChip === null
              ? 'bg-[#1565C0] text-white border-[#1565C0]'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {filterChips.map((chip) => {
          const isActive = chip === 'Status'
          return (
            <button
              key={chip}
              disabled={!isActive}
              onClick={() => {
                setActiveChip(chip)
                setPage(1)
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                !isActive
                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                  : activeChip === chip
                    ? 'bg-[#1565C0] text-white border-[#1565C0]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {chip}
            </button>
          )
        })}

        {/* Status sub-filter */}
        {activeChip === 'Status' && (
          <div className="flex items-center gap-2 flex-wrap ml-2 pl-2 border-l border-gray-200">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s)
                  setPage(1)
                }}
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
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Government Entity</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Payer DFSP</TableHead>
              <TableHead>Payment Account</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paginated.map((config) => (
                  <TableRow key={config.id ?? config.paymentAccount}>
                    <TableCell>{config.governmentEntity}</TableCell>
                    <TableCell>{config.program}</TableCell>
                    <TableCell>{config.payerDFSP}</TableCell>
                    <TableCell className="font-medium">{config.paymentAccount}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={config.status === 'Inactive' ? 'Inactive-G2P' : config.status}
                        label={config.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No records found.
                </TableCell>
              </TableRow>
            )}
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
              <SelectTrigger className="w-[70px]">
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
              {filtered.length === 0
                ? '0–0 of 0'
                : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} of ${filtered.length}`}
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

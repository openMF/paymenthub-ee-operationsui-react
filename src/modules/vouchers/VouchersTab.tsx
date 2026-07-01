import { useState } from 'react'
import { vouchers } from './mocks/vouchers.mock'
import type { Voucher } from './types'
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
  'Serial Number',
  'Functional ID',
  'Status',
  'Date Voucher',
] as const

type FilterChip = (typeof filterChips)[number]

const statuses: Voucher['status'][] = [
  'Active',
  'Inactive',
  'Canceled',
  'Expired',
  'Utilized',
  'Suspended',
]

export default function VouchersTab() {
  const [activeChip, setActiveChip] = useState<FilterChip | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filtered = vouchers.filter(
    (v) => statusFilter === 'all' || v.status === statusFilter
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

        {/* Status sub-filter, shown only when Status chip is active */}
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
              <TableHead>Serial Number</TableHead>
              <TableHead>Date Voucher Created</TableHead>
              <TableHead>Government Entity</TableHead>
              <TableHead>Functional ID</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((voucher) => (
              <TableRow key={voucher.serialNumber}>
                <TableCell className="font-medium">{voucher.serialNumber}</TableCell>
                <TableCell>{voucher.dateVoucherCreated}</TableCell>
                <TableCell>{voucher.governmentEntity}</TableCell>
                <TableCell>{voucher.functionalId}</TableCell>
                <TableCell>
                  <StatusBadge status={voucher.status} />
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
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

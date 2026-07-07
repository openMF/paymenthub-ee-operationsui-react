import { useState } from 'react'
import { beneficiaries } from './mocks/beneficiaries.mock'
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
  'Financial Institution',
  'Functional ID',
  'Financial Address',
] as const

export default function BeneficiariesTab() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const totalPages = Math.max(1, Math.ceil(beneficiaries.length / perPage))
  const paginated = beneficiaries.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-4">
      {/* Filter chips — placeholders until search/filter inputs are wired */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map((chip) => (
          <button
            key={chip}
            disabled
            className="rounded-full px-3 py-1 text-xs font-medium border bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Government Entity</TableHead>
              <TableHead>Financial Institution</TableHead>
              <TableHead>Functional ID</TableHead>
              <TableHead>Financial Address</TableHead>
              <TableHead>Payment Modality</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((b) => (
              <TableRow key={b.functionalId}>
                <TableCell>{b.governmentEntity}</TableCell>
                <TableCell>{b.financialInstitution}</TableCell>
                <TableCell className="font-medium">{b.functionalId}</TableCell>
                <TableCell>{b.financialAddress}</TableCell>
                <TableCell>{b.paymentModality}</TableCell>
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
              {beneficiaries.length === 0
                ? '0–0 of 0'
                : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, beneficiaries.length)} of ${beneficiaries.length}`}
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

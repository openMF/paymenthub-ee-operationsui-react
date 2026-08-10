import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle } from 'lucide-react'
import type { G2PConfig, GovernmentEntity, Program, DFSP } from './types'
import { fetchGovernmentEntities, fetchPrograms, fetchDFSPs } from '@/lib/api/g2pConfig'

const STATUSES: G2PConfig['status'][] = ['Active', 'Inactive']

interface Props {
  onCancel: () => void
  onSuccess: () => void
}

interface FormState {
  governmentEntity: string
  program: string
  payerDFSP: string
  paymentAccount: string
  status: string
}

const empty: FormState = {
  governmentEntity: '',
  program: '',
  payerDFSP: '',
  paymentAccount: '',
  status: '',
}

export default function CreateG2PTab({ onCancel, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(empty)
  const [success, setSuccess] = useState(false)

  const { data: governmentEntities } = useQuery({
    queryKey: ['governmentEntities'],
    queryFn: fetchGovernmentEntities,
  })
  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms,
  })
  const { data: dfsps } = useQuery({
    queryKey: ['dfsps'],
    queryFn: fetchDFSPs,
  })

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setForm(empty)
      onSuccess()
    }, 1500)
  }

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Create G2P Payment Config</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define a new government-to-person payment configuration
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            G2P Payment Config created successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="governmentEntity">Government Entity</Label>
            <Select
              value={form.governmentEntity}
              onValueChange={(v) => set('governmentEntity', v)}
              required
            >
              <SelectTrigger id="governmentEntity" className="w-full">
                <SelectValue placeholder="Select government entity" />
              </SelectTrigger>
              <SelectContent>
                {(governmentEntities ?? []).map((e: GovernmentEntity) => (
                  <SelectItem key={e.id} value={e.name}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="program">Program</Label>
            <Select
              value={form.program}
              onValueChange={(v) => set('program', v)}
              required
            >
              <SelectTrigger id="program" className="w-full">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {(programs ?? []).map((p: Program) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payerDFSP">Payer DFSP</Label>
            <Select
              value={form.payerDFSP}
              onValueChange={(v) => set('payerDFSP', v)}
              required
            >
              <SelectTrigger id="payerDFSP" className="w-full">
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {(dfsps ?? []).map((d: DFSP) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paymentAccount">Payment Account</Label>
            <Input
              id="paymentAccount"
              placeholder="12-digit account number"
              inputMode="numeric"
              pattern="[0-9]{12}"
              maxLength={12}
              value={form.paymentAccount}
              onChange={(e) => set('paymentAccount', e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set('status', v)}
              required
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white"
              disabled={success}
            >
              + Create Config
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

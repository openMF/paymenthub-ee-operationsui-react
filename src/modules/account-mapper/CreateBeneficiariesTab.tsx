import React, { useState } from 'react'
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

const PAYMENT_MODALITIES = [
  '(01) Mobile Money',
  '(02) Voucher',
  '(03) Digital Wallet',
  '(04) Bank Account',
]

interface Props {
  onCancel: () => void
  onSuccess: () => void
}

interface FormState {
  fullName: string
  governmentEntity: string
  financialInstitution: string
  functionalId: string
  financialAddress: string
  paymentModality: string
}

const empty: FormState = {
  fullName: '',
  governmentEntity: '',
  financialInstitution: '',
  functionalId: '',
  financialAddress: '',
  paymentModality: '',
}

export default function CreateBeneficiariesTab({ onCancel, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(empty)
  const [success, setSuccess] = useState(false)

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
          <h2 className="text-lg font-semibold text-gray-900">Add Beneficiary</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register new beneficiaries and map their financial accounts
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Beneficiary added successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="governmentEntity">Government Entity</Label>
            <Input
              id="governmentEntity"
              placeholder="Enter government entity"
              value={form.governmentEntity}
              onChange={(e) => set('governmentEntity', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="financialInstitution">Financial Institution</Label>
            <Input
              id="financialInstitution"
              placeholder="Enter financial institution"
              value={form.financialInstitution}
              onChange={(e) => set('financialInstitution', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="functionalId">Functional ID</Label>
            <Input
              id="functionalId"
              placeholder="Enter functional ID"
              value={form.functionalId}
              onChange={(e) => set('functionalId', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="financialAddress">Financial Address</Label>
            <Input
              id="financialAddress"
              placeholder="Enter financial address"
              value={form.financialAddress}
              onChange={(e) => set('financialAddress', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paymentModality">Payment Modality</Label>
            <Select
              value={form.paymentModality}
              onValueChange={(v) => set('paymentModality', v)}
              required
            >
              <SelectTrigger id="paymentModality" className="w-full">
                <SelectValue placeholder="Select modality" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_MODALITIES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
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
              Add Beneficiary
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

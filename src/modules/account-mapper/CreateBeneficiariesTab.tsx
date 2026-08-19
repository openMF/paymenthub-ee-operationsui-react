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
import { CheckCircle, AlertCircle, ChevronDown, Plus, X } from 'lucide-react'
import { submitBeneficiaries } from '@/lib/api/accountMapper'
import { PAYMENT_MODALITY_CODES, type BeneficiaryEntry, type ApiConfig, type PaymentModalityCode } from './types'

type Mode = 'register' | 'update'

interface Props {
  onCancel: () => void
  onSuccess: () => void
}

const MODALITIES_REQUIRING_BBIC: PaymentModalityCode[] = ['00', '01', '03']

const emptyEntry: BeneficiaryEntry = {
  payeeIdentity: '',
  paymentModality: '',
  bbic: '',
  financialAddress: '',
  sourceBbId: '',
}

const emptyConfig: ApiConfig = {
  apiUrl: '',
  callbackUrl: '',
  registeringInstitutionId: '',
}

export default function CreateBeneficiariesTab({ onCancel, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('register')
  const [entries, setEntries] = useState<BeneficiaryEntry[]>([{ ...emptyEntry }])
  const [config, setConfig] = useState<ApiConfig>({ ...emptyConfig })
  const [configOpen, setConfigOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setEntries([{ ...emptyEntry }])
    setSuccess(false)
    setError(null)
  }

  function setEntryField(index: number, field: keyof BeneficiaryEntry, value: string) {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    )
    setError(null)
  }

  function addEntry() {
    setEntries((prev) => [...prev, { ...emptyEntry }])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): string | null {
    for (const entry of entries) {
      if (!entry.payeeIdentity || !entry.paymentModality || !entry.financialAddress) {
        return 'Please fill in all required fields'
      }
      if (mode === 'update' && !entry.sourceBbId) {
        return 'Source BB ID is required in update mode'
      }
      const bbicRequired = MODALITIES_REQUIRING_BBIC.includes(entry.paymentModality)
      if (bbicRequired && !entry.bbic) {
        return 'Banking Institution Code (BBIC) is required for the selected payment modality'
      }
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setSuccess(false)
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await submitBeneficiaries(mode, entries, config)
      setSuccess(true)
      setEntries([{ ...emptyEntry }])
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
      }, 1500)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'register' ? 'Register Beneficiary' : 'Update Beneficiary'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === 'register'
              ? 'Register new beneficiaries and map their financial accounts'
              : 'Update payment details for existing beneficiaries'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              mode === 'register'
                ? 'bg-[#1565C0] text-white border-[#1565C0]'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Register Beneficiary
          </button>
          <button
            type="button"
            onClick={() => switchMode('update')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              mode === 'update'
                ? 'bg-[#1565C0] text-white border-[#1565C0]'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Update Beneficiary
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {mode === 'register' ? 'Beneficiaries registered successfully' : 'Beneficiaries updated successfully'}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Beneficiary {index + 1}</h3>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeEntry(index)}
                    aria-label={`Remove beneficiary ${index + 1}`}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`payeeIdentity-${index}`}>Payee Identity / Functional ID</Label>
                <Input
                  id={`payeeIdentity-${index}`}
                  placeholder="Enter functional ID"
                  maxLength={20}
                  value={entry.payeeIdentity}
                  onChange={(e) => setEntryField(index, 'payeeIdentity', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-400">
                  {mode === 'update'
                    ? 'Not updateable, used to identify record'
                    : 'The functional ID of the beneficiary'}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`paymentModality-${index}`}>Payment Modality</Label>
                <Select
                  value={entry.paymentModality}
                  onValueChange={(v) => setEntryField(index, 'paymentModality', v)}
                  required
                >
                  <SelectTrigger id={`paymentModality-${index}`} className="w-full">
                    <SelectValue placeholder="Select payment modality" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODALITY_CODES.map((m) => (
                      <SelectItem key={m.code} value={m.code}>
                        {m.code} - {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`bbic-${index}`}>Banking Institution Code (BBIC)</Label>
                <Input
                  id={`bbic-${index}`}
                  placeholder="Enter BBIC"
                  maxLength={11}
                  value={entry.bbic}
                  onChange={(e) => setEntryField(index, 'bbic', e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Required for bank account, mobile money, and digital wallet
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`financialAddress-${index}`}>Financial Address</Label>
                <Input
                  id={`financialAddress-${index}`}
                  placeholder="Enter financial address"
                  maxLength={30}
                  value={entry.financialAddress}
                  onChange={(e) => setEntryField(index, 'financialAddress', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-400">IBAN, phone number, or wallet address</p>
              </div>

              {mode === 'update' && (
                <div className="space-y-1.5">
                  <Label htmlFor={`sourceBbId-${index}`}>Source BB ID</Label>
                  <Input
                    id={`sourceBbId-${index}`}
                    placeholder="Enter source BB ID"
                    value={entry.sourceBbId}
                    onChange={(e) => setEntryField(index, 'sourceBbId', e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full gap-1.5"
            onClick={addEntry}
          >
            <Plus className="h-4 w-4" />
            Add Another Beneficiary
          </Button>

          {/* API config (collapsible) */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setConfigOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700"
            >
              API Configuration
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${configOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {configOpen && (
              <div className="space-y-4 border-t border-gray-100 px-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="apiUrl">API URL</Label>
                  <Input
                    id="apiUrl"
                    placeholder="https://..."
                    value={config.apiUrl}
                    onChange={(e) => setConfig((prev) => ({ ...prev, apiUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="callbackUrl">Callback URL</Label>
                  <Input
                    id="callbackUrl"
                    placeholder="https://..."
                    value={config.callbackUrl}
                    onChange={(e) => setConfig((prev) => ({ ...prev, callbackUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registeringInstitutionId">Registering Institution ID</Label>
                  <Input
                    id="registeringInstitutionId"
                    placeholder="Enter institution ID"
                    value={config.registeringInstitutionId}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, registeringInstitutionId: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white"
              disabled={submitting || success}
            >
              {mode === 'register' ? 'Submit Registration' : 'Submit Update'}
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

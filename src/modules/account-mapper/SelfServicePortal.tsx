import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { lookupBeneficiary, updateBeneficiary } from '@/lib/api/accountMapper'
import { beneficiaries as mockBeneficiaries } from './mocks/beneficiaries.mock'

const PAYMENT_MODALITIES = [
  '(01) Mobile Money',
  '(02) Voucher',
  '(03) Digital Wallet',
  '(04) Bank Account',
]

interface BeneficiaryData {
  functionalId: string
  governmentEntity: string
  financialInstitution: string
  financialAddress: string
  paymentModality: string
}

function findInMock(beneficiaryId: string): BeneficiaryData | null {
  const hit = mockBeneficiaries.find(
    (b) =>
      b.functionalId === beneficiaryId ||
      b.financialAddress.includes(beneficiaryId),
  )
  return hit
    ? {
        functionalId: hit.functionalId,
        governmentEntity: hit.governmentEntity,
        financialInstitution: hit.financialInstitution,
        financialAddress: hit.financialAddress,
        paymentModality: hit.paymentModality,
      }
    : null
}

export default function SelfServicePortal() {
  const [searchParams] = useSearchParams()
  const beneficiaryId = searchParams.get('beneficiaryId') ?? ''

  const [financialInstitution, setFinancialInstitution] = useState('')
  const [financialAddress, setFinancialAddress] = useState('')
  const [paymentModality, setPaymentModality] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Lookup query — falls back to mock on error
  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['beneficiary', beneficiaryId],
    queryFn: () => lookupBeneficiary(beneficiaryId),
    enabled: !!beneficiaryId,
    retry: 1,
  })

  // Resolve beneficiary: API first, mock fallback
  const beneficiary: BeneficiaryData | null =
    apiData ?? (isError ? findInMock(beneficiaryId) : null)

  // Pre-fill form once data resolves
  useEffect(() => {
    if (beneficiary) {
      setFinancialInstitution(beneficiary.financialInstitution)
      setFinancialAddress(beneficiary.financialAddress)
      setPaymentModality(beneficiary.paymentModality)
    }
  }, [beneficiary?.functionalId]) // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: () =>
      updateBeneficiary(beneficiaryId, {
        financialInstitution,
        financialAddress,
        paymentModality,
      }),
    onSuccess: () => {
      setSuccessMsg('Your payment details have been updated successfully.')
      setErrorMsg('')
    },
    onError: () => {
      setErrorMsg('Failed to update details. Please try again.')
      setSuccessMsg('')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    mutation.mutate()
  }

  // ── States ─────────────────────────────────────────────────────────────

  const shell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-120">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/payment-hub-ee.png"
            alt="Payment Hub EE"
            className="h-10 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="h-1 bg-linear-to-r from-[#1565C0] via-[#42A5F5] to-[#1565C0]" />
          <div className="px-8 py-8">
            {content}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Powered by Mifos Initiative</p>
      </div>
    </div>
  )

  if (!beneficiaryId) {
    return shell(
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle size={16} className="shrink-0" />
        No beneficiary ID provided. Please use a valid link.
      </div>,
    )
  }

  if (isLoading) {
    return shell(
      <div className="flex flex-col items-center gap-3 py-6">
        <Loader2 size={24} className="text-[#1565C0] animate-spin" />
        <p className="text-sm text-gray-500">Looking up your account…</p>
      </div>,
    )
  }

  if (!beneficiary) {
    return shell(
      <div className="flex items-start gap-2 text-sm text-red-600">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <span>No account details found for ID: <span className="font-mono font-medium">{beneficiaryId}</span></span>
      </div>,
    )
  }

  // ── Main form ───────────────────────────────────────────────────────────

  return shell(
    <>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Update Payment Details</h1>
        <p className="text-sm text-gray-500 mt-1">Review and update your financial account information below.</p>
      </div>

      {successMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 mb-4">
          <CheckCircle size={15} className="shrink-0 mt-0.5" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Read-only fields */}
        <div className="space-y-1.5">
          <Label htmlFor="beneficiaryId">Beneficiary ID</Label>
          <Input
            id="beneficiaryId"
            value={beneficiary.functionalId}
            readOnly
            className="bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="governmentEntity">Government Entity</Label>
          <Input
            id="governmentEntity"
            value={beneficiary.governmentEntity}
            readOnly
            className="bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Editable fields */}
        <div className="space-y-1.5">
          <Label htmlFor="financialInstitution">Financial Institution</Label>
          <Input
            id="financialInstitution"
            placeholder="Enter your bank or wallet provider"
            value={financialInstitution}
            onChange={(e) => setFinancialInstitution(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="financialAddress">Financial Address</Label>
          <Input
            id="financialAddress"
            placeholder="Account number, mobile number, or wallet ID"
            value={financialAddress}
            onChange={(e) => setFinancialAddress(e.target.value)}
            required
          />
          <p className="text-xs text-gray-400">Your registered account number, mobile number, or wallet identifier.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paymentModality">Payment Modality</Label>
          <Select value={paymentModality} onValueChange={setPaymentModality} required>
            <SelectTrigger id="paymentModality" className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_MODALITIES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white mt-2"
        >
          {mutation.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
            : 'Update Details'}
        </Button>
      </form>
    </>,
  )
}

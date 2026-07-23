import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { CheckCircle, AlertCircle, UserCircle } from 'lucide-react'

const PAYMENT_MODALITIES = [
  '(01) Mobile Money',
  '(02) Voucher',
  '(03) Digital Wallet',
  '(04) Bank Account',
]

const FINANCIAL_INSTITUTIONS = [
  'GreenBank',
  'BlueBank',
  'RedBank',
  'HDFC',
  'SBI',
  'DigiWallet',
  'VoucherFSP',
]

interface FormState {
  functionalId: string
  fullName: string
  financialInstitution: string
  financialAddress: string
  paymentModality: string
  confirmAddress: string
}

const empty: FormState = {
  functionalId: '',
  fullName: '',
  financialInstitution: '',
  financialAddress: '',
  paymentModality: '',
  confirmAddress: '',
}

type Step = 'lookup' | 'update' | 'success'

export default function SelfServicePortal() {
  const [step, setStep] = useState<Step>('lookup')
  const [form, setForm] = useState<FormState>(empty)
  const [lookupId, setLookupId] = useState('')
  const [lookupError, setLookupError] = useState(false)

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    // Simulate lookup: any non-empty ID that starts with "BEN-" is found
    if (lookupId.trim().toUpperCase().startsWith('BEN-')) {
      setLookupError(false)
      setForm((prev) => ({ ...prev, functionalId: lookupId.trim().toUpperCase() }))
      setStep('update')
    } else {
      setLookupError(true)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.financialAddress !== form.confirmAddress) return
    setStep('success')
  }

  function handleReset() {
    setStep('lookup')
    setLookupId('')
    setLookupError(false)
    setForm(empty)
  }

  const mismatch = form.confirmAddress.length > 0 && form.financialAddress !== form.confirmAddress

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <img src="/payment-hub-ee.png" alt="Payment Hub EE" className="h-8 w-auto object-contain" />
        </div>
        <Link
          to="/account-mapper"
          className="text-xs text-[#1565C0] hover:underline font-medium"
        >
          ← Back to Admin
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Step 1 — Lookup */}
          {step === 'lookup' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-1 bg-linear-to-r from-[#1565C0] via-[#42A5F5] to-[#1565C0]" />
              <div className="px-8 py-8 space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <UserCircle size={24} className="text-[#1565C0]" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">Update Your Account</h1>
                  <p className="text-sm text-gray-500">
                    Enter your Functional ID to look up your record and update your financial account details.
                  </p>
                </div>

                <form onSubmit={handleLookup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="lookupId">Functional ID</Label>
                    <Input
                      id="lookupId"
                      placeholder="e.g. BEN-FIN-001"
                      value={lookupId}
                      onChange={(e) => { setLookupId(e.target.value); setLookupError(false) }}
                      required
                    />
                    {lookupError && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                        <AlertCircle size={12} />
                        No record found for this ID. Please check and try again.
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white"
                  >
                    Look Up My Record
                  </Button>
                </form>

                <p className="text-center text-xs text-gray-400">
                  Your Functional ID is provided by your government programme administrator.
                </p>
              </div>
            </div>
          )}

          {/* Step 2 — Update form */}
          {step === 'update' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-1 bg-linear-to-r from-[#1565C0] via-[#42A5F5] to-[#1565C0]" />
              <div className="px-8 py-8 space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Update Account Details</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Record found for <span className="font-medium text-gray-700">{form.functionalId}</span>. Fill in your updated details below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full legal name"
                      value={form.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
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
                        <SelectValue placeholder="Select how you want to receive payments" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_MODALITIES.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="financialInstitution">Financial Institution</Label>
                    <Select
                      value={form.financialInstitution}
                      onValueChange={(v) => set('financialInstitution', v)}
                      required
                    >
                      <SelectTrigger id="financialInstitution" className="w-full">
                        <SelectValue placeholder="Select your bank or wallet provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {FINANCIAL_INSTITUTIONS.map((fi) => (
                          <SelectItem key={fi} value={fi}>{fi}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="financialAddress">Financial Address</Label>
                    <Input
                      id="financialAddress"
                      placeholder="Account number, mobile number, or wallet ID"
                      value={form.financialAddress}
                      onChange={(e) => set('financialAddress', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-400">
                      Enter your account number, registered mobile number, or wallet identifier.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmAddress">Confirm Financial Address</Label>
                    <Input
                      id="confirmAddress"
                      placeholder="Re-enter to confirm"
                      value={form.confirmAddress}
                      onChange={(e) => set('confirmAddress', e.target.value)}
                      required
                      className={mismatch ? 'border-red-400 focus-visible:ring-red-300' : ''}
                    />
                    {mismatch && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle size={12} />
                        Financial addresses do not match.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white"
                      disabled={mismatch}
                    >
                      Submit Update Request
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleReset}
                    >
                      Start Over
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 'success' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center">
              <div className="h-1 bg-linear-to-r from-emerald-400 via-emerald-300 to-emerald-400" />
              <div className="px-8 py-10 space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Request Submitted</h2>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Your account update request has been received. Changes will be reviewed and applied within 1–2 business days.
                </p>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-left text-sm space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Functional ID</span>
                    <span className="font-medium text-gray-800">{form.functionalId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Institution</span>
                    <span className="font-medium text-gray-800">{form.financialInstitution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Modality</span>
                    <span className="font-medium text-gray-800">{form.paymentModality}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleReset}
                >
                  Submit Another Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        Powered by Mifos Initiative
      </footer>
    </div>
  )
}

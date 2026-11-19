export interface Beneficiary {
  governmentEntity: string
  financialInstitution: string
  functionalId: string
  financialAddress: string
  paymentModality: string
  bbic?: string
}

// GovStack Payments BB spec (v3.0 and v2.x), section 7.1 "Account Mapper": paymentModality
export const PAYMENT_MODALITY_CODES = [
  { code: '00', label: 'Bank Account' },
  { code: '01', label: 'Mobile Money' },
  { code: '02', label: 'Voucher' },
  { code: '03', label: 'Digital Wallet' },
  { code: '04', label: 'Proxy' },
] as const

export type PaymentModalityCode = (typeof PAYMENT_MODALITY_CODES)[number]['code']

// account-mapper images without PHEE-474 store the modality as a number, so 00 comes back as 0
export function paymentModalityLabel(code: string | null | undefined): string {
  if (!code) return ''
  const padded = /^\d$/.test(code) ? `0${code}` : code
  const modality = PAYMENT_MODALITY_CODES.find((m) => m.code === padded)
  return modality ? `${modality.code} - ${modality.label}` : code
}

export interface BeneficiaryEntry {
  payeeIdentity: string
  paymentModality: PaymentModalityCode | ''
  bbic: string
  financialAddress: string
}

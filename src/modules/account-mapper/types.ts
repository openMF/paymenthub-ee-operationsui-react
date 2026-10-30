export interface Beneficiary {
  governmentEntity: string
  financialInstitution: string
  functionalId: string
  financialAddress: string
  paymentModality: string
  bbic?: string
}

// account-mapper's PaymentModalityEnum
export const PAYMENT_MODALITY_CODES = [
  { code: '00', label: 'Account ID' },
  { code: '01', label: 'MSISDN' },
  { code: '02', label: 'Virtual Address' },
  { code: '03', label: 'Wallet ID' },
  { code: '04', label: 'Voucher' },
] as const

export type PaymentModalityCode = (typeof PAYMENT_MODALITY_CODES)[number]['code']

// account-mapper stores the modality as a number, so 00 comes back as 0
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

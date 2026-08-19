export interface Beneficiary {
  governmentEntity: string
  financialInstitution: string
  functionalId: string
  financialAddress: string
  paymentModality: string
  bbic?: string
}

export const PAYMENT_MODALITY_CODES = [
  { code: '00', label: 'Bank Account' },
  { code: '01', label: 'Mobile Money' },
  { code: '02', label: 'Voucher' },
  { code: '03', label: 'Digital Wallet' },
  { code: '04', label: 'Proxy' },
] as const

export type PaymentModalityCode = (typeof PAYMENT_MODALITY_CODES)[number]['code']

export interface BeneficiaryEntry {
  payeeIdentity: string
  paymentModality: PaymentModalityCode | ''
  bbic: string
  financialAddress: string
  sourceBbId: string
}

export interface ApiConfig {
  apiUrl: string
  callbackUrl: string
  registeringInstitutionId: string
}

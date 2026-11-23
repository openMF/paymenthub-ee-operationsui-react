// Account Mapper API: the BFF's /api/v1/beneficiaries, which proxies to
// paymenthub-ee-account-mapper for the logged-in tenant (PHEE-469).
//
// lookupBeneficiary and updateBeneficiary serve only the public Self Service
// Portal, which has no login and so no tenant; they are not wired to the BFF.

import axios from 'axios'
import apiClient from './client'
import type { Beneficiary, BeneficiaryEntry } from '@/modules/account-mapper/types'
import { paymentModalityLabel } from '@/modules/account-mapper/types'

/** A beneficiary as account-mapper returns it. */
interface AccountMapperRecord {
  registeringInstitutionId: string
  payeeIdentity: string
  paymentModality: string | null
  financialAddress: string | null
  bankingInstitutionCode: string | null
}

export interface BeneficiaryPage {
  content: Beneficiary[]
  totalElements: number
  totalPages: number
}

export function toBeneficiary(record: AccountMapperRecord): Beneficiary {
  return {
    governmentEntity: record.registeringInstitutionId,
    financialInstitution: record.bankingInstitutionCode ?? '',
    functionalId: record.payeeIdentity,
    financialAddress: record.financialAddress ?? '',
    paymentModality: paymentModalityLabel(record.paymentModality),
  }
}

/** page is 0-based, as in account-mapper. */
export const fetchBeneficiaries = async (page: number, pageSize: number): Promise<BeneficiaryPage> => {
  const response = await apiClient.get('/beneficiaries', { params: { page, pageSize } })
  const records: AccountMapperRecord[] = response.data?.content ?? []
  return {
    content: records.map(toBeneficiary),
    totalElements: response.data?.totalElements ?? records.length,
    totalPages: response.data?.totalPages ?? 1,
  }
}

export interface SubmitResult {
  succeeded: string[]
  failed: { payeeIdentity: string; message: string }[]
}

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message) return message
    if (error.response) return `HTTP ${error.response.status}`
  }
  return error instanceof Error ? error.message : String(error)
}

/**
 * Registers (POST) or updates (PUT) each beneficiary in turn. The BFF answers
 * only once account-mapper has stored the record, so a failure here is real:
 * already registered, unknown payee, or rejected by account-mapper.
 */
export const submitBeneficiaries = async (
  mode: 'register' | 'update',
  beneficiaries: BeneficiaryEntry[],
): Promise<SubmitResult> => {
  const result: SubmitResult = { succeeded: [], failed: [] }
  for (const entry of beneficiaries) {
    const body = {
      payeeIdentity: entry.payeeIdentity,
      paymentModality: entry.paymentModality,
      financialAddress: entry.financialAddress,
      bankingInstitutionCode: entry.bbic || null,
    }
    try {
      if (mode === 'register') {
        await apiClient.post('/beneficiaries', body)
      } else {
        await apiClient.put('/beneficiaries', body)
      }
      result.succeeded.push(entry.payeeIdentity)
    } catch (error) {
      result.failed.push({ payeeIdentity: entry.payeeIdentity, message: errorMessage(error) })
    }
  }
  return result
}

/** The beneficiary, or null when there is none (404). Any other failure is thrown, not hidden. */
export const lookupBeneficiary = async (beneficiaryId: string) => {
  try {
    const response = await apiClient.get(`/beneficiary/${beneficiaryId}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export const updateBeneficiary = async (
  beneficiaryId: string,
  data: { financialInstitution: string; financialAddress: string; paymentModality: string; bbic?: string },
) => {
  // A failed update is thrown, so the caller never reports it as successful.
  const response = await apiClient.put('/identityAccountMapper/beneficiary', {
    beneficiaryId,
    ...data,
  })
  return response.data
}

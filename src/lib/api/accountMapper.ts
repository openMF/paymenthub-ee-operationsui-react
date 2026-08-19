import apiClient from './client'
import type { BeneficiaryEntry, ApiConfig } from '@/modules/account-mapper/types'

export const lookupBeneficiary = async (beneficiaryId: string) => {
  const response = await apiClient.get(`/beneficiary/${beneficiaryId}`)
  return response.data
}

export const updateBeneficiary = async (
  beneficiaryId: string,
  data: { financialInstitution: string; financialAddress: string; paymentModality: string; bbic?: string },
) => {
  const response = await apiClient.put('/identityAccountMapper/beneficiary', {
    beneficiaryId,
    ...data,
  })
  return response.data
}

// No backend endpoint deployed yet for bulk register/update — logs the
// request shape so operators can verify the payload, then resolves as if
// the call succeeded.
export const submitBeneficiaries = async (
  mode: 'register' | 'update',
  beneficiaries: BeneficiaryEntry[],
  config: ApiConfig,
) => {
  const payload = { mode, beneficiaries, config }
  console.log(`[mock] ${mode === 'register' ? 'POST' : 'PUT'} /identityAccountMapper/beneficiary`, payload)
  await new Promise((resolve) => setTimeout(resolve, 800))
  return { message: `${beneficiaries.length} beneficiary(ies) ${mode === 'register' ? 'registered' : 'updated'} successfully` }
}

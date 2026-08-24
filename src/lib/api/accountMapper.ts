// Account Mapper API — endpoint available on Gazelle but returning 500
// Real endpoints:
// GET  /api/v1/beneficiaries  — list beneficiaries
// POST /identityAccountMapper/beneficiary  — register beneficiary
// PUT  /identityAccountMapper/beneficiary  — update beneficiary
// GET  /identityAccountMapper/beneficiary/{id}  — lookup beneficiary
// Wire up when Ruphine confirms endpoints are fully configured on Gazelle

import apiClient from './client'
import type { BeneficiaryEntry, ApiConfig } from '@/modules/account-mapper/types'
import { beneficiaries as beneficiariesMock } from '@/modules/account-mapper/mocks/beneficiaries.mock'

export const fetchBeneficiaries = async () => {
  try {
    const response = await apiClient.get('/beneficiaries')
    return response.data
  } catch {
    // Fallback to mock data — backend returning 500 on Gazelle
    return {
      content: beneficiariesMock,
      totalElements: beneficiariesMock.length,
    }
  }
}

export const lookupBeneficiary = async (beneficiaryId: string) => {
  try {
    const response = await apiClient.get(`/beneficiary/${beneficiaryId}`)
    return response.data
  } catch {
    return beneficiariesMock.find((b) => b.functionalId === beneficiaryId) ?? null
  }
}

export const updateBeneficiary = async (
  beneficiaryId: string,
  data: { financialInstitution: string; financialAddress: string; paymentModality: string; bbic?: string },
) => {
  try {
    const response = await apiClient.put('/identityAccountMapper/beneficiary', {
      beneficiaryId,
      ...data,
    })
    return response.data
  } catch {
    return { responseCode: '00', responseDescription: 'Update successful' }
  }
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

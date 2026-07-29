import apiClient from './client'

export const lookupBeneficiary = async (beneficiaryId: string) => {
  const response = await apiClient.get(`/beneficiary/${beneficiaryId}`)
  return response.data
}

export const updateBeneficiary = async (
  beneficiaryId: string,
  data: { financialInstitution: string; financialAddress: string; paymentModality: string },
) => {
  const response = await apiClient.put(`/beneficiary/${beneficiaryId}`, data)
  return response.data
}

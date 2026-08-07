import apiClient from './client'

export const fetchMainBatches = async () => {
  const response = await apiClient.get('/batches')
  return { data: response.data.data }
}

export const fetchTransfers = async () => {
  const response = await apiClient.get('/transfers', {
    params: { page: 0, size: 20 },
  })
  return response.data
}

export const fetchSubBatches = async (batchId: string) => {
  const response = await apiClient.get(`/batches/${batchId}/subBatches`)
  return response.data
}

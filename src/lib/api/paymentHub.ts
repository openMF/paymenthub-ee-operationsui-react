import apiClient from './client'

export const fetchMainBatches = async () => {
  console.log('Fetching batches...')
  const response = await apiClient.get('/batches')
  console.log('Batches response:', response.data)
  return response.data
}

export const fetchTransfers = async () => {
  const response = await apiClient.get('/transfers', {
    params: { page: 0, size: 20 },
  })
  return response.data
}

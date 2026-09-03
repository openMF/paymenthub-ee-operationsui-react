import apiClient from './client'
import type { MainBatch } from '@/modules/payment-hub/types'

export const fetchMainBatches = async (): Promise<{ data: MainBatch[] }> => {
  const response = await apiClient.get('/batches')
  return { data: response.data.data }
}

export const fetchTransfers = async () => {
  const response = await apiClient.get('/transfers', {
    params: { page: 0, size: 20 },
  })
  return response.data
}

export const fetchBatchTransactions = async (batchId: string) => {
  const response = await apiClient.get('/batch/transactions', {
    params: { batchId, page: 0, size: 20 },
  })
  return response.data
}

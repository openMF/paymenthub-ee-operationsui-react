import { isAxiosError } from 'axios'
import apiClient from './client'
import type { BatchSummary, BatchTransfer, MainBatch } from '@/modules/payment-hub/types'

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

// The BFF requires X-Correlation-ID on /batches/{batchId}; any unique value will do.
function correlationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `ops-ui-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** The batch's summary and its sub-batches (`subBatchSummaryList`). */
export const fetchBatchSummary = async (batchId: string): Promise<BatchSummary> => {
  const response = await apiClient.get(`/batches/${encodeURIComponent(batchId)}`, {
    headers: { 'X-Correlation-ID': correlationId() },
  })
  return response.data
}

interface Instruction {
  instructionId: string
  status: string | null
  amount: number | null
  payeeFunctionalId: string | null
  subBatchId: string | null
  startedAt: number | null
  completedAt: number | null
}

export const INSTRUCTION_PAGE_SIZE = 100
export const INSTRUCTION_MAX_PAGES = 50

/**
 * Every transfer in a batch. The BFF keeps them in two places:
 * - Mojaloop batches: under each sub-batch's ID. GET /batches/{batchId}?associations=all lists them
 *   (amount, payee, sub-batch), one page of every sub-batch per request, so pages are requested until
 *   one comes back empty. Its totalInstruction field isn't reliable, so it isn't used.
 * - Closedloop batches: under the batch's own ID. Only GET /batch/transactions finds them (status only).
 * Both are asked; a transfer found in both is listed once, with the richer row.
 */
export const fetchBatchTransfers = async (batchId: string): Promise<BatchTransfer[]> => {
  const byId = new Map<string, BatchTransfer>()

  for (let page = 0; page < INSTRUCTION_MAX_PAGES; page++) {
    let instructions: Instruction[]
    try {
      const response = await apiClient.get(`/batches/${encodeURIComponent(batchId)}`, {
        params: { associations: 'all', offset: page * INSTRUCTION_PAGE_SIZE, limit: INSTRUCTION_PAGE_SIZE },
        headers: { 'X-Correlation-ID': correlationId() },
      })
      instructions = response.data?.instructionList ?? []
    } catch (error) {
      // 404 = the BFF has no payment detail for this batch; any other failure is reported.
      if (isAxiosError(error) && error.response?.status === 404) break
      throw error
    }
    if (instructions.length === 0) break
    const before = byId.size
    for (const i of instructions) {
      byId.set(i.instructionId, {
        transactionId: i.instructionId,
        status: i.status,
        amount: i.amount,
        payeeFunctionalId: i.payeeFunctionalId,
        subBatchId: i.subBatchId,
        startedAt: i.startedAt,
        completedAt: i.completedAt,
      })
    }
    // A short page means every sub-batch has run out; a page with nothing new means the
    // offset isn't moving, so asking again would only repeat it.
    if (instructions.length < INSTRUCTION_PAGE_SIZE || byId.size === before) break
  }

  const statuses: Record<string, string> = (await fetchBatchTransactions(batchId)) ?? {}
  for (const [transactionId, status] of Object.entries(statuses)) {
    if (!byId.has(transactionId)) {
      byId.set(transactionId, {
        transactionId, status, amount: null, payeeFunctionalId: null, subBatchId: null, startedAt: null, completedAt: null,
      })
    }
  }
  return [...byId.values()]
}

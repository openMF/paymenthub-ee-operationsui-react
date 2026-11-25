import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// PHEE-468: Batch Detail showed "Total Transactions 4" above "No transactions found" for Mojaloop
// batches. It now lists the transfers from every sub-batch, and the sub-batches themselves.
vi.mock('@/lib/api/paymentHub', () => ({
  fetchMainBatches: vi.fn().mockResolvedValue({
    data: [{ batchId: 'B-1', totalTransactions: 2, completed: 2, failed: 0, ongoing: 0, totalAmount: 26, payerFsp: 'greenbank', status: 'COMPLETED' }],
  }),
  fetchBatchTransfers: vi.fn().mockResolvedValue([
    { transactionId: 'T1', status: 'COMPLETED', amount: 10, payeeFunctionalId: '0495822412', subBatchId: 'SUB-1', startedAt: null, completedAt: null },
    { transactionId: 'T2', status: 'COMPLETED', amount: 16, payeeFunctionalId: '0495822412', subBatchId: 'SUB-1', startedAt: null, completedAt: null },
  ]),
  fetchBatchSummary: vi.fn().mockResolvedValue({
    batchId: 'B-1',
    subBatchSummaryList: [{ subBatchId: 'SUB-1', modes: 'MOJALOOP', payeeFspSet: ['bluebank'], total: 2, successful: 2, failed: 0, totalAmount: 26, status: 'COMPLETED', startedAt: null }],
  }),
}))

const { default: BatchDetail } = await import('./BatchDetail')

describe('BatchDetail', () => {
  it("lists the batch's transfers and its sub-batches", async () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/payment-hub/batch/B-1']}>
          <Routes><Route path="/payment-hub/batch/:batchId" element={<BatchDetail />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(await screen.findByText('T1')).toBeInTheDocument()
    expect(screen.getByText('T2')).toBeInTheDocument()
    expect(screen.getByText('Transactions (2)')).toBeInTheDocument()
    expect(screen.getByText('16.00')).toBeInTheDocument()
    const subBatchRow = screen.getByText('MOJALOOP').closest('tr')!
    expect(within(subBatchRow).getByTitle('SUB-1')).toBeInTheDocument()
    expect(within(subBatchRow).getByText('bluebank')).toBeInTheDocument()
    expect(screen.queryByText('No transactions found.')).toBeNull()
  })
})

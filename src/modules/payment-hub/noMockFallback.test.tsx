import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AxiosError, AxiosHeaders } from 'axios'
import type { ReactNode } from 'react'

// PHEE-468: a failed call used to show bundled mock rows under "showing cached data".
vi.mock('@/lib/api/paymentHub', () => ({
  fetchMainBatches: vi.fn(),
  fetchTransfers: vi.fn(),
  fetchBatchTransactions: vi.fn(),
}))

const api = await import('@/lib/api/paymentHub')
const { default: MainBatchesTab } = await import('./MainBatchesTab')
const { default: TransfersTab } = await import('./TransfersTab')
const { default: Dashboard } = await import('@/pages/Dashboard')

function http401() {
  const headers = new AxiosHeaders()
  return new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 401, statusText: 'Unauthorized', headers, config: { headers }, data: {},
  })
}

function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('screens show an error, not mock data, when Payment Hub fails', () => {
  beforeEach(() => vi.resetAllMocks())

  it('Main Batches: an API error renders the error and no rows', async () => {
    vi.mocked(api.fetchMainBatches).mockRejectedValue(http401())
    renderWithClient(<MainBatchesTab />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load batches: HTTP 401 Unauthorized')
    expect(screen.getByText('No batches loaded.')).toBeInTheDocument()
    expect(screen.queryByText(/BATCH-001-2026/)).not.toBeInTheDocument()
    expect(screen.queryByText(/cached data/)).not.toBeInTheDocument()
  })

  it('Main Batches: an empty response renders "No records found"', async () => {
    vi.mocked(api.fetchMainBatches).mockResolvedValue({ data: [] })
    renderWithClient(<MainBatchesTab />)

    expect(await screen.findByText('No records found.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Transfers: an API error renders the error and no rows', async () => {
    vi.mocked(api.fetchTransfers).mockRejectedValue(new Error('Network Error'))
    renderWithClient(<TransfersTab />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load transfers: Network Error')
    expect(screen.getByText('No transfers loaded.')).toBeInTheDocument()
  })

  it('Dashboard: a batch error is shown, and vouchers are "not available", not samples', async () => {
    vi.mocked(api.fetchMainBatches).mockRejectedValue(http401())
    renderWithClient(<Dashboard />)

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 401')
    expect(screen.getByText('No batches loaded.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Vouchers are not available')
    expect(screen.queryByText(/VCH-2024-001/)).not.toBeInTheDocument()
  })
})

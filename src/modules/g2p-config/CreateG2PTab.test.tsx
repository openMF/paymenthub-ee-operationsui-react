import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// PHEE-468: Create showed "G2P Payment Config created successfully" without sending anything.
vi.mock('@/lib/api/g2pConfig', () => ({
  fetchGovernmentEntities: vi.fn().mockResolvedValue([]),
  fetchPrograms: vi.fn().mockResolvedValue([]),
  fetchDFSPs: vi.fn().mockResolvedValue([]),
}))

const { default: CreateG2PTab } = await import('./CreateG2PTab')

describe('CreateG2PTab', () => {
  it('says saving is not available and cannot be submitted', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <CreateG2PTab onCancel={() => {}} />
      </QueryClientProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saving G2P payment configs is not available yet')
    expect(screen.getByRole('button', { name: '+ Create Config' })).toBeDisabled()
    expect(screen.queryByText(/created successfully/)).toBeNull()
  })
})

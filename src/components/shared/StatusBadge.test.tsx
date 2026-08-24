import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders a green badge for COMPLETED', () => {
    render(<StatusBadge status="COMPLETED" />)
    const badge = screen.getByText('COMPLETED')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-700')
  })

  it('renders a red badge for FAILED', () => {
    render(<StatusBadge status="FAILED" />)
    const badge = screen.getByText('FAILED')
    expect(badge.className).toContain('bg-red-100')
    expect(badge.className).toContain('text-red-700')
  })

  it('renders a blue badge for IN_PROGRESS', () => {
    render(<StatusBadge status="IN_PROGRESS" />)
    const badge = screen.getByText('IN_PROGRESS')
    expect(badge.className).toContain('bg-blue-100')
    expect(badge.className).toContain('text-blue-700')
  })

  it('renders a grey badge for null status', () => {
    render(<StatusBadge status={null} />)
    const badge = screen.getByText('-')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-600')
  })

  it('renders a grey badge for undefined status', () => {
    render(<StatusBadge status={undefined} />)
    const badge = screen.getByText('-')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-600')
  })

  it('renders a grey badge for an unknown status', () => {
    render(<StatusBadge status="SomethingUnmapped" />)
    const badge = screen.getByText('SomethingUnmapped')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-600')
  })
})

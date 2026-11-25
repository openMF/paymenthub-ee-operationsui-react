import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'
import LoadError, { NotAvailable } from './LoadError'
import { errorText } from '@/lib/errorText'

function axiosError(status: number, statusText = '') {
  const headers = new AxiosHeaders()
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', undefined, undefined, {
    status, statusText, headers, config: { headers }, data: {},
  })
}

describe('LoadError', () => {
  it('gives the HTTP status when there was a response', () => {
    expect(errorText(axiosError(401, 'Unauthorized'))).toBe('HTTP 401 Unauthorized')
    expect(errorText(axiosError(502))).toBe('HTTP 502')
  })

  it('gives the message when there was no response', () => {
    expect(errorText(new Error('Network Error'))).toBe('Network Error')
    expect(errorText('?')).toBe('unknown error')
  })

  it('renders what failed and why', () => {
    render(<LoadError what="batches" error={axiosError(403, 'Forbidden')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load batches: HTTP 403 Forbidden')
  })

  it('renders "not available" for a screen that is not connected yet', () => {
    render(<NotAvailable what="Vouchers are" />)
    expect(screen.getByRole('status')).toHaveTextContent("Vouchers are not available yet: this screen isn't connected to Payment Hub.")
  })
})

import { describe, expect, it } from 'vitest'
import { formatAmount } from './formatAmount'

// PHEE-416: amounts were divided by 100 (a 52 USD batch showed as 0.52) and their sign dropped.
describe('formatAmount', () => {
  it('shows whole amounts as returned, in major units', () => {
    expect(formatAmount(52, null, 'en-US')).toBe('52')
    expect(formatAmount(10, null, 'en-US')).toBe('10')
    expect(formatAmount(1234567, null, 'en-US')).toBe('1,234,567')
  })

  it('shows decimals, up to two places', () => {
    expect(formatAmount(10.5, null, 'en-US')).toBe('10.5')
    expect(formatAmount('100.00', null, 'en-US')).toBe('100')
    expect(formatAmount('16.25', null, 'en-US')).toBe('16.25')
    expect(formatAmount(0.125, null, 'en-US')).toBe('0.13')
  })

  it('keeps the sign of a negative amount', () => {
    expect(formatAmount(-10, null, 'en-US')).toBe('-10')
    expect(formatAmount('-16.5', null, 'en-US')).toBe('-16.5')
  })

  it('shows zero as 0, and a missing or invalid amount as -', () => {
    expect(formatAmount(0, null, 'en-US')).toBe('0')
    expect(formatAmount(null)).toBe('-')
    expect(formatAmount(undefined)).toBe('-')
    expect(formatAmount('')).toBe('-')
    expect(formatAmount('abc')).toBe('-')
  })

  it('appends the currency when the row has one', () => {
    expect(formatAmount('10', 'USD', 'en-US')).toBe('10 USD')
    expect(formatAmount(16, 'KES', 'en-US')).toBe('16 KES')
    expect(formatAmount(16, '', 'en-US')).toBe('16')
  })
})

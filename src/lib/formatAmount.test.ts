import { describe, expect, it } from 'vitest'
import { currencyDigits, formatAmount } from './formatAmount'

// PHEE-416: amounts were divided by 100 (a 52 USD batch showed as 0.52) and their sign dropped.
describe('formatAmount', () => {
  it('shows amounts as returned, in major units, with two decimals when there is no currency', () => {
    expect(formatAmount(52, null, 'en-US')).toBe('52.00')
    expect(formatAmount(10, null, 'en-US')).toBe('10.00')
    expect(formatAmount(1234567, null, 'en-US')).toBe('1,234,567.00')
  })

  it('rounds to the decimals shown', () => {
    expect(formatAmount(10.5, null, 'en-US')).toBe('10.50')
    expect(formatAmount('100.00', null, 'en-US')).toBe('100.00')
    expect(formatAmount('16.25', null, 'en-US')).toBe('16.25')
    expect(formatAmount(0.125, null, 'en-US')).toBe('0.13')
  })

  it('keeps the sign of a negative amount', () => {
    expect(formatAmount(-10, null, 'en-US')).toBe('-10.00')
    expect(formatAmount('-16.5', null, 'en-US')).toBe('-16.50')
  })

  it('shows zero as 0.00, and a missing or invalid amount as -', () => {
    expect(formatAmount(0, null, 'en-US')).toBe('0.00')
    expect(formatAmount(null)).toBe('-')
    expect(formatAmount(undefined)).toBe('-')
    expect(formatAmount('')).toBe('-')
    expect(formatAmount('abc')).toBe('-')
  })

  it("uses the currency's decimal places and appends the currency", () => {
    expect(formatAmount('10', 'USD', 'en-US')).toBe('10.00 USD')
    expect(formatAmount(16, 'KES', 'en-US')).toBe('16.00 KES')
    expect(formatAmount(1500, 'JPY', 'en-US')).toBe('1,500 JPY')
    expect(formatAmount(1.5, 'KWD', 'en-US')).toBe('1.500 KWD')
    expect(formatAmount(16, '', 'en-US')).toBe('16.00')
  })

  it('uses the locale for separators', () => {
    expect(formatAmount(1234.5, 'EUR', 'de-DE')).toBe('1.234,50 EUR')
  })
})

describe('currencyDigits', () => {
  it('is the ISO 4217 minor unit, or 2 when unknown', () => {
    expect(currencyDigits('USD')).toBe(2)
    expect(currencyDigits('JPY')).toBe(0)
    expect(currencyDigits('KWD')).toBe(3)
    expect(currencyDigits(null)).toBe(2)
    expect(currencyDigits('not-a-code')).toBe(2)
  })
})

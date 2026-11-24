import { describe, it, expect } from 'vitest'
import { formatTime, timeZoneName, withTimeZone } from './formatTime'

// 10:57:55 UTC on 23 Nov 2026, the start of a verify-batches batch
const T = 1795431475000

describe('formatTime', () => {
  it('shows the time in the given zone', () => {
    expect(formatTime(T, 'UTC', 'en-AU')).toBe('23/11/2026, 10:57:55 am')
    expect(formatTime(T, 'Australia/Adelaide', 'en-AU')).toBe('23/11/2026, 9:27:55 pm')
  })

  it("defaults to the browser's zone", () => {
    expect(formatTime(T)).toBe(new Date(T).toLocaleString())
  })

  it("is '-' when there is no time", () => {
    expect(formatTime(null)).toBe('-')
    expect(formatTime(undefined)).toBe('-')
    expect(formatTime(0)).toBe('-')
    expect(formatTime(Number.NaN)).toBe('-')
  })
})

describe('withTimeZone', () => {
  it('names the zone in the label', () => {
    expect(withTimeZone('Start Time', 'Australia/Adelaide')).toBe('Start Time (Australia/Adelaide)')
  })

  it("defaults to the browser's zone", () => {
    expect(withTimeZone('Start Time')).toBe(`Start Time (${timeZoneName()})`)
    expect(timeZoneName()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
  })
})

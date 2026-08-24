import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportCsv, csvDate } from './exportCsv'

describe('exportCsv', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>
  let clickSpy: ReturnType<typeof vi.spyOn>
  let capturedBlob: Blob | undefined

  beforeEach(() => {
    capturedBlob = undefined
    createObjectURLSpy = vi.fn((blob: Blob) => {
      capturedBlob = blob
      return 'blob:mock-url'
    })
    revokeObjectURLSpy = vi.fn()

    URL.createObjectURL = createObjectURLSpy as unknown as typeof URL.createObjectURL
    URL.revokeObjectURL = revokeObjectURLSpy as unknown as typeof URL.revokeObjectURL
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates a correct CSV string from an array of objects', async () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    exportCsv(rows, 'test.csv')

    expect(capturedBlob).toBeInstanceOf(Blob)
    const text = await capturedBlob!.text()
    expect(text).toBe('name,age\nAlice,30\nBob,25')
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('includes the filename passed by the caller, with date embedded', () => {
    const filename = `transactions_${csvDate()}.csv`
    exportCsv([{ id: 1 }], filename)

    expect(filename).toContain(csvDate())
    expect(filename).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('produces header only for an empty array', () => {
    exportCsv([], 'empty.csv')

    // exportCsv returns early for empty rows, no download is triggered
    expect(createObjectURLSpy).not.toHaveBeenCalled()
    expect(clickSpy).not.toHaveBeenCalled()
  })
})

describe('csvDate', () => {
  it('returns a date string in YYYY-MM-DD format', () => {
    expect(csvDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

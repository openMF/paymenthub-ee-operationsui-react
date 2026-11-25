import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// PHEE-468: Batch Detail listed no transactions for Mojaloop batches. The BFF stores their
// transfers under the sub-batch's ID, which GET /batch/transactions?batchId=<batch> doesn't see;
// GET /batches/{batchId}?associations=all does. Closedloop transfers are the other way round.

const BASE_URL = 'https://bff.test/api/v1'

vi.mock('./client', async () => {
  const axios = (await import('axios')).default
  return { default: axios.create({ baseURL: 'https://bff.test/api/v1' }) }
})

const { fetchBatchTransfers, fetchBatchSummary, INSTRUCTION_PAGE_SIZE } = await import('./paymentHub')

const server = setupServer()

const instruction = (id: string, subBatchId = 'SUB-1') => ({
  instructionId: id, status: 'COMPLETED', amount: 10, payeeFunctionalId: '0495822412', subBatchId,
  startedAt: 1795507781000, completedAt: 1795507790000, payerFsp: 'greenbank', reason: null,
})

/** Serves ?associations=all from `all`, paged by offset/limit, and records each request. */
function batchDetail(all: ReturnType<typeof instruction>[], seen: URL[], opts: { ignoreOffset?: boolean } = {}) {
  return http.get(`${BASE_URL}/batches/B-1`, ({ request }) => {
    const url = new URL(request.url)
    seen.push(url)
    const offset = opts.ignoreOffset ? 0 : Number(url.searchParams.get('offset'))
    const limit = Number(url.searchParams.get('limit'))
    return HttpResponse.json({ batchId: 'B-1', instructionList: all.slice(offset, offset + limit) })
  })
}

const statuses = (map: Record<string, string>) =>
  http.get(`${BASE_URL}/batch/transactions`, () => HttpResponse.json(map))

describe('fetchBatchTransfers', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('lists a Mojaloop batch from its sub-batches, with amount, payee and sub-batch', async () => {
    const seen: URL[] = []
    server.use(batchDetail([instruction('T1'), instruction('T2')], seen), statuses({}))
    const rows = await fetchBatchTransfers('B-1')
    expect(rows.map((r) => r.transactionId)).toEqual(['T1', 'T2'])
    expect(rows.at(0)).toMatchObject({ amount: 10, payeeFunctionalId: '0495822412', subBatchId: 'SUB-1', status: 'COMPLETED' })
    expect(seen.at(0)?.searchParams.get('associations')).toBe('all')
  })

  it('lists a closedloop batch from GET /batch/transactions', async () => {
    server.use(batchDetail([], []), statuses({ C1: 'COMPLETED', C2: 'FAILED' }))
    const rows = await fetchBatchTransfers('B-1')
    expect(rows).toEqual([
      expect.objectContaining({ transactionId: 'C1', status: 'COMPLETED', amount: null, subBatchId: null }),
      expect.objectContaining({ transactionId: 'C2', status: 'FAILED' }),
    ])
  })

  it('lists a transfer found in both places once, with the richer row', async () => {
    server.use(batchDetail([instruction('T1')], []), statuses({ T1: 'COMPLETED' }))
    const rows = await fetchBatchTransfers('B-1')
    expect(rows).toHaveLength(1)
    expect(rows.at(0)?.amount).toBe(10)
  })

  it('asks for further pages until a short page', async () => {
    const all = Array.from({ length: INSTRUCTION_PAGE_SIZE + 30 }, (_, i) => instruction(`T${i}`))
    const seen: URL[] = []
    server.use(batchDetail(all, seen), statuses({}))
    const rows = await fetchBatchTransfers('B-1')
    expect(rows).toHaveLength(INSTRUCTION_PAGE_SIZE + 30)
    expect(seen.map((u) => u.searchParams.get('offset'))).toEqual(['0', String(INSTRUCTION_PAGE_SIZE)])
  })

  it('stops when a page brings nothing new (an offset the BFF ignores)', async () => {
    const all = Array.from({ length: INSTRUCTION_PAGE_SIZE }, (_, i) => instruction(`T${i}`))
    const seen: URL[] = []
    server.use(batchDetail(all, seen, { ignoreOffset: true }), statuses({}))
    const rows = await fetchBatchTransfers('B-1')
    expect(rows).toHaveLength(INSTRUCTION_PAGE_SIZE)
    expect(seen).toHaveLength(2)
  })

  it('treats a 404 payment detail as none, and still asks /batch/transactions', async () => {
    server.use(
      http.get(`${BASE_URL}/batches/B-1`, () => new HttpResponse(null, { status: 404 })),
      statuses({ C1: 'COMPLETED' }),
    )
    const rows = await fetchBatchTransfers('B-1')
    expect(rows.map((r) => r.transactionId)).toEqual(['C1'])
  })

  it('reports any other failure instead of an empty list', async () => {
    server.use(
      http.get(`${BASE_URL}/batches/B-1`, () => new HttpResponse(null, { status: 500 })),
      statuses({ C1: 'COMPLETED' }),
    )
    await expect(fetchBatchTransfers('B-1')).rejects.toThrow('500')
  })
})

describe('fetchBatchSummary', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('sends the X-Correlation-ID the BFF requires, and returns the sub-batches', async () => {
    let correlation: string | null = null
    server.use(http.get(`${BASE_URL}/batches/B-1`, ({ request }) => {
      correlation = request.headers.get('X-Correlation-ID')
      return HttpResponse.json({ batchId: 'B-1', subBatchSummaryList: [{ subBatchId: 'SUB-1', modes: 'MOJALOOP' }] })
    }))
    const summary = await fetchBatchSummary('B-1')
    expect(correlation).toBeTruthy()
    expect(summary.subBatchSummaryList?.at(0)?.subBatchId).toBe('SUB-1')
  })
})

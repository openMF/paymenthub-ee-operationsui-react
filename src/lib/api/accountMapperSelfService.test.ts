import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// PHEE-468: the Self Service Portal's lookup fell back to mock beneficiaries on any error, and a
// failed update returned "Update successful".
const BASE_URL = 'https://bff.test/api/v1'

vi.mock('./client', async () => {
  const axios = (await import('axios')).default
  return { default: axios.create({ baseURL: 'https://bff.test/api/v1' }) }
})

const { lookupBeneficiary, updateBeneficiary } = await import('./accountMapper')

const server = setupServer()

describe('Self Service Portal calls', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('lookup: a beneficiary that does not exist (404) is null, not a mock record', async () => {
    server.use(http.get(`${BASE_URL}/beneficiary/BEN-FIN-001`, () => new HttpResponse(null, { status: 404 })))
    await expect(lookupBeneficiary('BEN-FIN-001')).resolves.toBeNull()
  })

  it('lookup: any other failure is thrown', async () => {
    server.use(http.get(`${BASE_URL}/beneficiary/x`, () => new HttpResponse(null, { status: 500 })))
    await expect(lookupBeneficiary('x')).rejects.toThrow('500')
  })

  it('update: a failed update is thrown, never reported as successful', async () => {
    server.use(http.put(`${BASE_URL}/identityAccountMapper/beneficiary`, () => new HttpResponse(null, { status: 503 })))
    await expect(
      updateBeneficiary('x', { financialInstitution: 'a', financialAddress: 'b', paymentModality: 'c' }),
    ).rejects.toThrow('503')
  })
})

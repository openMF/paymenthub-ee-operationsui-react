import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const BASE_URL = 'https://bff.test/api/v1'

vi.mock('./client', async () => {
  const axios = (await import('axios')).default
  return { default: axios.create({ baseURL: 'https://bff.test/api/v1' }) }
})

const { fetchBeneficiaries, submitBeneficiaries, toBeneficiary } = await import('./accountMapper')

const server = setupServer()

const record = {
  registeringInstitutionId: 'greenbank',
  payeeIdentity: '0495822412',
  paymentModality: '00',
  financialAddress: '12',
  bankingInstitutionCode: 'bluebank',
}

describe('accountMapper', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('maps an account-mapper record onto the screen model with the modality label', () => {
    expect(toBeneficiary(record)).toEqual({
      governmentEntity: 'greenbank',
      financialInstitution: 'bluebank',
      functionalId: '0495822412',
      financialAddress: '12',
      paymentModality: '00 - Account ID',
    })
  })

  it('labels the modality account-mapper reads back without its leading zero', () => {
    expect(toBeneficiary({ ...record, paymentModality: '1' }).paymentModality).toBe('01 - MSISDN')
  })

  it('passes paging through and uses the server totals', async () => {
    let query = ''
    server.use(
      http.get(`${BASE_URL}/beneficiaries`, ({ request }) => {
        query = new URL(request.url).search
        return HttpResponse.json({ content: [record], totalElements: 41, totalPages: 5 })
      }),
    )

    const page = await fetchBeneficiaries(2, 10)

    expect(query).toBe('?page=2&pageSize=10')
    expect(page.totalElements).toBe(41)
    expect(page.totalPages).toBe(5)
    expect(page.content[0].functionalId).toBe('0495822412')
  })

  it('rejects when the BFF fails, instead of showing mock data', async () => {
    server.use(http.get(`${BASE_URL}/beneficiaries`, () => new HttpResponse(null, { status: 502 })))

    await expect(fetchBeneficiaries(0, 10)).rejects.toThrow()
  })

  it('registers with POST and update with PUT, reporting each failure with the BFF message', async () => {
    const posted: unknown[] = []
    server.use(
      http.post(`${BASE_URL}/beneficiaries`, async ({ request }) => {
        const body = (await request.json()) as { payeeIdentity: string }
        posted.push(body)
        return body.payeeIdentity === 'dup'
          ? HttpResponse.json({ message: 'Beneficiary dup is already registered' }, { status: 409 })
          : HttpResponse.json(record, { status: 201 })
      }),
    )

    const result = await submitBeneficiaries('register', [
      { payeeIdentity: '0495822412', paymentModality: '00', bbic: 'bluebank', financialAddress: '12' },
      { payeeIdentity: 'dup', paymentModality: '04', bbic: '', financialAddress: 'V1' },
    ])

    expect(result.succeeded).toEqual(['0495822412'])
    expect(result.failed).toEqual([{ payeeIdentity: 'dup', message: 'Beneficiary dup is already registered' }])
    expect(posted[1]).toEqual({ payeeIdentity: 'dup', paymentModality: '04', financialAddress: 'V1', bankingInstitutionCode: null })
  })

  it('updates with PUT', async () => {
    let method = ''
    server.use(
      http.put(`${BASE_URL}/beneficiaries`, ({ request }) => {
        method = request.method
        return HttpResponse.json(record)
      }),
    )

    const result = await submitBeneficiaries('update', [
      { payeeIdentity: '0495822412', paymentModality: '01', bbic: 'bluebank', financialAddress: '34' },
    ])

    expect(method).toBe('PUT')
    expect(result.failed).toEqual([])
  })
})

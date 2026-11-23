import { http, HttpResponse } from 'msw'
import { mainBatches } from '../data/mainBatches'
import { transfers } from '../data/transfers'
import { batchTransactionsByBatch } from '../data/batchTransactions'
import { beneficiaries } from '../data/beneficiaries'

// Dev-only (npm run dev with VITE_ENABLE_MSW=true, see main.tsx): sample Payment Hub data for
// working on the UI without a backend. Production code never imports src/mocks.
export const paymentHubHandlers = [
  http.get('*/batches', () => HttpResponse.json({ data: mainBatches })),
  http.get('*/transfers', () =>
    HttpResponse.json({ content: transfers, totalElements: transfers.length, totalPages: 1 })),
  http.get('*/batch/transactions', ({ request }) => {
    const batchId = new URL(request.url).searchParams.get('batchId') ?? ''
    return HttpResponse.json(batchTransactionsByBatch[batchId] ?? {})
  }),
  // account-mapper's shape, which fetchBeneficiaries maps to the screen's
  http.get('*/beneficiaries', () =>
    HttpResponse.json({
      content: beneficiaries.map((b) => ({
        registeringInstitutionId: b.governmentEntity,
        payeeIdentity: b.functionalId,
        paymentModality: b.paymentModality.match(/\d+/)?.[0] ?? null,
        financialAddress: b.financialAddress,
        bankingInstitutionCode: b.financialInstitution,
      })),
      totalElements: beneficiaries.length,
      totalPages: 1,
    })),
]

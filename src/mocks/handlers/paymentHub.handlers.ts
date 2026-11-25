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
  // A batch's summary (one sample sub-batch, Mojaloop) and, with ?associations=all, its transfers
  // as the BFF lists Mojaloop ones: under the sub-batch, paged by offset/limit.
  http.get('*/batches/:batchId', ({ params, request }) => {
    const batch = mainBatches.find((b) => b.batchId === params.batchId)
    if (!batch) return new HttpResponse(null, { status: 404 })
    const subBatchId = `${batch.batchId}-SUB-1`
    const url = new URL(request.url)
    if (url.searchParams.get('associations') === 'all') {
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 10)
      const instructionList = Object.entries(batchTransactionsByBatch[batch.batchId] ?? {})
        .slice(offset, offset + limit)
        .map(([instructionId, status]) => ({
          instructionId, status, amount: null, payeeFunctionalId: null, subBatchId,
          startedAt: batch.startedAt, completedAt: batch.completedAt,
        }))
      return HttpResponse.json({ batchId: batch.batchId, instructionList })
    }
    return HttpResponse.json({
      batchId: batch.batchId, total: batch.totalTransactions, successful: batch.completed, failed: batch.failed,
      ongoing: batch.ongoing, totalAmount: batch.totalAmount, status: batch.status, totalSubBatches: 1,
      subBatchSummaryList: [{
        subBatchId, status: batch.status, modes: 'MOJALOOP', payeeFspSet: ['BlueBank'],
        total: batch.totalTransactions, successful: batch.completed, failed: batch.failed, ongoing: batch.ongoing,
        totalAmount: batch.totalAmount, startedAt: batch.startedAt, completedAt: batch.completedAt,
      }],
    })
  }),
  // Closedloop transfers are found here, under the batch's own ID; the samples are listed as
  // Mojaloop above, so this answers empty, as the BFF does for a Mojaloop batch.
  http.get('*/batch/transactions', () => HttpResponse.json({})),
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

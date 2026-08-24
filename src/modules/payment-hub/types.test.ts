import { describe, it, expect } from 'vitest'
import type { MainBatch, Transfer } from './types'

describe('MainBatch', () => {
  it('has all required fields', () => {
    const batch: MainBatch = {
      id: 1,
      batchId: 'batch-1',
      totalTransactions: 100,
      ongoing: 10,
      failed: 5,
      completed: 85,
      totalAmount: 1000,
      completedAmount: 850,
      payerFsp: 'FSP-A',
      status: 'IN_PROGRESS',
      startedAt: 1700000000000,
      completedAt: null,
      registeringInstitutionId: 'inst-1',
      correlationId: 'corr-1',
    }

    expect(Object.keys(batch).sort()).toEqual(
      [
        'id',
        'batchId',
        'totalTransactions',
        'ongoing',
        'failed',
        'completed',
        'totalAmount',
        'completedAmount',
        'payerFsp',
        'status',
        'startedAt',
        'completedAt',
        'registeringInstitutionId',
        'correlationId',
      ].sort()
    )
  })

  it('allows nullable fields to be null', () => {
    const batch: MainBatch = {
      id: 2,
      batchId: 'batch-2',
      totalTransactions: 0,
      ongoing: 0,
      failed: 0,
      completed: 0,
      totalAmount: null,
      completedAmount: null,
      payerFsp: 'FSP-B',
      status: null,
      startedAt: null,
      completedAt: null,
      registeringInstitutionId: null,
      correlationId: 'corr-2',
    }

    expect(batch.totalAmount).toBeNull()
    expect(batch.status).toBeNull()
  })
})

describe('Transfer', () => {
  it('has all required fields', () => {
    const transfer: Transfer = {
      id: 1,
      transactionId: 'txn-1',
      startedAt: 1700000000000,
      completedAt: 1700000005000,
      status: 'COMPLETED',
      statusDetail: 'ok',
      payeeDfspId: 'dfsp-payee',
      payeePartyId: 'party-payee',
      payeePartyIdType: 'MSISDN',
      payerDfspId: 'dfsp-payer',
      payerPartyId: 'party-payer',
      payerPartyIdType: 'MSISDN',
      amount: '100.00',
      currency: 'USD',
      direction: 'OUTBOUND',
      errorInformation: null,
      batchId: 'batch-1',
      clientCorrelationId: 'corr-1',
    }

    expect(Object.keys(transfer).sort()).toEqual(
      [
        'id',
        'transactionId',
        'startedAt',
        'completedAt',
        'status',
        'statusDetail',
        'payeeDfspId',
        'payeePartyId',
        'payeePartyIdType',
        'payerDfspId',
        'payerPartyId',
        'payerPartyIdType',
        'amount',
        'currency',
        'direction',
        'errorInformation',
        'batchId',
        'clientCorrelationId',
      ].sort()
    )
  })

  it('allows nullable fields to be null', () => {
    const transfer: Transfer = {
      id: 2,
      transactionId: 'txn-2',
      startedAt: null,
      completedAt: null,
      status: null,
      statusDetail: null,
      payeeDfspId: null,
      payeePartyId: null,
      payeePartyIdType: null,
      payerDfspId: null,
      payerPartyId: null,
      payerPartyIdType: null,
      amount: null,
      currency: null,
      direction: null,
      errorInformation: null,
      batchId: null,
      clientCorrelationId: null,
    }

    expect(transfer.status).toBeNull()
    expect(transfer.amount).toBeNull()
  })
})

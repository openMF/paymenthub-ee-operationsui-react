export interface MainBatch {
  id: number
  batchId: string
  totalTransactions: number
  ongoing: number
  failed: number
  completed: number
  totalAmount: number | null
  completedAmount: number | null
  payerFsp: string
  status: string | null
  startedAt: number | null
  completedAt: number | null
  registeringInstitutionId: string | null
  correlationId: string
}

export interface BatchTransaction {
  transactionId: string
  status: string
}

/** One sub-batch, from `subBatchSummaryList` in GET /batches/{batchId}. */
export interface SubBatchSummary {
  subBatchId: string
  status: string | null
  modes: string | null
  payeeFspSet: string[] | null
  total: number | null
  successful: number | null
  failed: number | null
  ongoing: number | null
  totalAmount: number | null
  startedAt: number | null
  completedAt: number | null
}

/** GET /batches/{batchId}: the batch's summary and its sub-batches. */
export interface BatchSummary {
  batchId: string
  total: number | null
  successful: number | null
  failed: number | null
  ongoing: number | null
  totalAmount: number | null
  status: string | null
  totalSubBatches: number | null
  subBatchSummaryList: SubBatchSummary[] | null
}

/**
 * A transfer in a batch, merged from the two places the BFF lists them: closedloop transfers
 * carry the batch's own ID (GET /batch/transactions, status only), Mojaloop transfers their
 * sub-batch's ID (GET /batches/{batchId}?associations=all, with amount and payee).
 */
export interface BatchTransfer {
  transactionId: string
  status: string | null
  amount: number | null
  payeeFunctionalId: string | null
  subBatchId: string | null
  startedAt: number | null
  completedAt: number | null
}

export interface Transfer {
  id: number
  transactionId: string
  startedAt: number | null
  completedAt: number | null
  status: string | null
  statusDetail: string | null
  payeeDfspId: string | null
  payeePartyId: string | null
  payeePartyIdType: string | null
  payerDfspId: string | null
  payerPartyId: string | null
  payerPartyIdType: string | null
  amount: string | null
  currency: string | null
  direction: string | null
  errorInformation: string | null
  batchId: string | null
  clientCorrelationId: string | null
}

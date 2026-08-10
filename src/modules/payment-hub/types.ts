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

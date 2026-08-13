// Mock shape mirrors the real API: a key-value map of transactionId -> status,
// keyed here by batchId so the mock fallback can look up the selected batch.
export const batchTransactionsByBatch: Record<string, Record<string, string>> = {
  'BATCH-001-2026': {
    'a1b2c3d4-0001-0001-0001-000000000001': 'COMPLETED',
    'a1b2c3d4-0001-0001-0001-000000000002': 'COMPLETED',
    'a1b2c3d4-0001-0001-0001-000000000003': 'COMPLETED',
  },
  'BATCH-002-2026': {
    'a1b2c3d4-0002-0002-0002-000000000001': 'COMPLETED',
    'a1b2c3d4-0002-0002-0002-000000000002': 'IN_PROGRESS',
    'a1b2c3d4-0002-0002-0002-000000000003': 'FAILED',
  },
  'BATCH-003-2026': {
    'a1b2c3d4-0003-0003-0003-000000000001': 'COMPLETED',
    'a1b2c3d4-0003-0003-0003-000000000002': 'COMPLETED',
  },
  'BATCH-004-2026': {
    'a1b2c3d4-0004-0004-0004-000000000001': 'FAILED',
    'a1b2c3d4-0004-0004-0004-000000000002': 'FAILED',
  },
}

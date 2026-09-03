// Vouchers API — backend not yet implemented on Gazelle
// Real endpoint: GET https://ops.mifos.gazelle.test/api/v1/vouchers
// Wire up when Ruphine confirms the endpoint is available

import { vouchers as vouchersMock } from '@/modules/vouchers/mocks/vouchers.mock'

export const fetchVouchers = async () => {
  // TODO: replace with real API call when backend is available
  // Real endpoint will be: GET /api/v1/vouchers
  return {
    content: vouchersMock,
    totalElements: vouchersMock.length,
    totalPages: 1,
  }
}

export const createVoucher = async (data: Record<string, string>) => {
  // TODO: replace with real API call when backend is available
  // Real endpoint will be: POST /api/v1/vouchers
  console.log('Creating voucher:', data)
  return { success: true, message: 'Voucher created successfully' }
}

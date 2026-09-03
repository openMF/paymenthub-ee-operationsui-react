export interface Voucher {
  serialNumber: string
  dateVoucherCreated: string
  governmentEntity: string
  functionalId: string
  status: 'Canceled' | 'Inactive' | 'Active' | 'Expired' | 'Utilized' | 'Suspended'
}

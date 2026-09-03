export interface G2PConfig {
  id?: number
  governmentEntity: string
  program: string
  payerDFSP: string
  paymentAccount: string
  status: 'Active' | 'Inactive'
}

export interface GovernmentEntity {
  id: number
  name: string
}

export interface Program {
  id: number
  name: string
}

export interface DFSP {
  id: number
  name: string
}

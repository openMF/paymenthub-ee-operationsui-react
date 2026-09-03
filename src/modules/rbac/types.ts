export interface RBACUser {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Operator' | 'Auditor'
  status: 'Active' | 'Locked'
}

export type Role = 'Admin' | 'Operator' | 'Auditor'

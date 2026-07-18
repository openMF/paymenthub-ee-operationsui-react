import type { RBACUser } from '../types'

export const mockUsers: RBACUser[] = [
  {
    id: 'u001',
    name: 'User Admin A',
    email: 'admin.a@mifos.org',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 'u002',
    name: 'User Operator B',
    email: 'operator.b@mifos.org',
    role: 'Operator',
    status: 'Active',
  },
  {
    id: 'u003',
    name: 'User Auditor C',
    email: 'auditor.c@mifos.org',
    role: 'Auditor',
    status: 'Active',
  },
  {
    id: 'u004',
    name: 'User Operator D',
    email: 'operator.d@mifos.org',
    role: 'Operator',
    status: 'Locked',
  },
  {
    id: 'u005',
    name: 'User Admin E',
    email: 'admin.e@mifos.org',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 'u006',
    name: 'User Auditor F',
    email: 'auditor.f@mifos.org',
    role: 'Auditor',
    status: 'Active',
  },
  {
    id: 'u007',
    name: 'User Operator G',
    email: 'operator.g@mifos.org',
    role: 'Operator',
    status: 'Locked',
  },
  {
    id: 'u008',
    name: 'User Auditor H',
    email: 'auditor.h@mifos.org',
    role: 'Auditor',
    status: 'Active',
  },
]

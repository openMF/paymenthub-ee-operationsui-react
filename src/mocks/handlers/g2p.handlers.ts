import { http, HttpResponse } from 'msw'

const g2pConfigs = [
  { id: 1, governmentEntity: 'Ministry of Corporate Affairs', program: 'Scholarship Support', payerDFSP: 'Green Bank', paymentAccount: '123456789012', status: 'Active' },
  { id: 2, governmentEntity: 'Ministry of Education', program: 'School Meals', payerDFSP: 'Blue Bank', paymentAccount: '223344556677', status: 'Inactive' },
  { id: 3, governmentEntity: 'Ministry of Health', program: 'Healthcare Initiative', payerDFSP: 'Red Bank', paymentAccount: '334455667788', status: 'Active' },
]

export const g2pHandlers = [
  http.get('http://localhost:8084/g2pPaymentConfig', () => HttpResponse.json(g2pConfigs)),
  http.post('http://localhost:8084/g2pPaymentConfig', () => HttpResponse.json({ message: 'Created successfully' }, { status: 201 })),
  http.get('http://localhost:8084/governmentEntity', () => HttpResponse.json([
    { id: 1, name: 'Ministry of Corporate Affairs' },
    { id: 2, name: 'Ministry of Education' },
    { id: 3, name: 'Ministry of Health' },
  ])),
  http.get('http://localhost:8084/program', () => HttpResponse.json([
    { id: 1, name: 'Scholarship Support' },
    { id: 2, name: 'School Meals' },
    { id: 3, name: 'Healthcare Initiative' },
  ])),
  http.get('http://localhost:8084/dfsp', () => HttpResponse.json([
    { id: 1, name: 'Green Bank' },
    { id: 2, name: 'Blue Bank' },
    { id: 3, name: 'Red Bank' },
  ])),
]

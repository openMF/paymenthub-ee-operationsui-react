import axios from 'axios'

const g2pClient = axios.create({ baseURL: import.meta.env.VITE_G2P_SERVICE_URL || 'http://localhost:8084' })

export const fetchG2PConfigs = async () => {
  const response = await g2pClient.get('/g2pPaymentConfig')
  return response.data
}

export const fetchGovernmentEntities = async () => {
  const response = await g2pClient.get('/governmentEntity')
  return response.data
}

export const fetchPrograms = async () => {
  const response = await g2pClient.get('/program')
  return response.data
}

export const fetchDFSPs = async () => {
  const response = await g2pClient.get('/dfsp')
  return response.data
}

import axios from 'axios'
import { getEnv } from '@/lib/runtime-config'

const apiClient = axios.create({
  baseURL: getEnv('VITE_API_BASE_URL'),
})

apiClient.interceptors.request.use((config) => {
  const tenant = localStorage.getItem('tenant') || 'greenbank'
  config.headers.set('Platform-TenantId', tenant)

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kc_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

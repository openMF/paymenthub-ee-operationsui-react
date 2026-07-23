import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const tenant = localStorage.getItem('tenant') || 'greenbank'
  config.headers.set('Platform-TenantId', tenant)

  const token = localStorage.getItem('kc_token')
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

export default apiClient

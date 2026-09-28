import axios from 'axios'
import { getEnv } from '@/lib/runtime-config'
import { createAuthInterceptors } from './authInterceptors'

const apiClient = axios.create({
  baseURL: getEnv('VITE_API_BASE_URL'),
})

createAuthInterceptors(apiClient)

export default apiClient

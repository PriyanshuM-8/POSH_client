import api from '@/lib/api'

export const getDashboardService = async () => {
  const res = await api.get('/dashboard')
  return res.data.data // Already returns { data: {...} } from ApiResponse
}

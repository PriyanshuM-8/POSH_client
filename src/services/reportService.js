import api from '@/lib/api'

export const getReportsService = async () => {
  const res = await api.get('/reports')
  return res.data.data
}

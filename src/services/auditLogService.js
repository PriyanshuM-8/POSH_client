import api from '@/lib/api'

export const getAuditLogsService = async (params = {}) => {
  const res = await api.get('/audit-logs', { params })
  return res.data.data
}

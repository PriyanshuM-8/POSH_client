import api from '@/lib/api'

export const getMyNotificationsService = async (params = {}) => {
  const res = await api.get('/notifications', { params })
  return res.data.data
}

export const markNotificationReadService = async (id) => {
  const res = await api.patch(`/notifications/${encodeURIComponent(id)}/read`)
  return res.data.data
}

export const markAllNotificationsReadService = async () => {
  const res = await api.patch('/notifications/read-all')
  return res.data.data
}

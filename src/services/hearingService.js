import api from '@/lib/api'

export const getAllHearingsService = async (params = {}) => {
  const res = await api.get('/hearings', { params })
  return res.data.data
}

export const getHearingByIdService = async (id) => {
  const res = await api.get(`/hearings/${encodeURIComponent(id)}`)
  return res.data.data
}

export const scheduleHearingService = async (data) => {
  const res = await api.post('/hearings', data)
  return res.data.data
}

export const updateHearingService = async (id, data) => {
  const res = await api.patch(`/hearings/${encodeURIComponent(id)}`, data)
  return res.data.data
}

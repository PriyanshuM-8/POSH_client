import api from '@/lib/api'

export const getAllCommitteesService = async (params = {}) => {
  const res = await api.get('/committees', { params })
  return res.data.data
}

export const getCommitteeByIdService = async (id) => {
  const res = await api.get(`/committees/${encodeURIComponent(id)}`)
  return res.data.data
}

export const createCommitteeService = async (data) => {
  const res = await api.post('/committees', data)
  return res.data.data
}

export const updateCommitteeService = async (id, data) => {
  const res = await api.patch(`/committees/${encodeURIComponent(id)}`, data)
  return res.data.data
}

export const updateCommitteeStatusService = async (id, data) => {
  const res = await api.patch(`/committees/${encodeURIComponent(id)}/status`, data)
  return res.data.data
}

export const deleteCommitteeService = async (id) => {
  const res = await api.delete(`/committees/${encodeURIComponent(id)}`)
  return res.data.data
}

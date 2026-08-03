import api from '@/lib/api'

export const getAllComplaintsService = async (params = {}) => {
  const res = await api.get('/complaints', { params })
  return res.data.data // { complaints, pagination }
}

export const getMyComplaintsService = async (params = {}) => {
  const res = await api.get('/complaints/my', { params })
  return res.data.data
}

export const getComplaintByIdService = async (id) => {
  const res = await api.get(`/complaints/${encodeURIComponent(id)}`)
  return res.data.data
}

export const getComplaintTimelineService = async (id) => {
  const res = await api.get(`/complaints/${encodeURIComponent(id)}/timeline`)
  return res.data.data
}

export const raiseComplaintService = async (data) => {
  const res = await api.post('/complaints', data)
  return res.data.data
}

export const acceptComplaintService = async (id, data) => {
  const res = await api.patch(`/complaints/${encodeURIComponent(id)}/accept`, data)
  return res.data.data
}

export const rejectComplaintService = async (id, data) => {
  const res = await api.patch(`/complaints/${encodeURIComponent(id)}/reject`, data)
  return res.data.data
}

export const assignCommitteeToComplaintService = async (id, data) => {
  const res = await api.patch(`/complaints/${encodeURIComponent(id)}/assign-committee`, data)
  return res.data.data
}

export const uploadEvidenceService = async (id, formData) => {
  const res = await api.post(`/complaints/${encodeURIComponent(id)}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export const assignAdminToComplaintService = async (id, data) => {
  const res = await api.patch(`/complaints/${encodeURIComponent(id)}/assign-admin`, data)
  return res.data.data
}

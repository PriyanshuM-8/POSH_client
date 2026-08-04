import api from '@/lib/api'

export const getAllUsersService = async (params = {}) => {
  const res = await api.get('/users', { params })
  return res.data.data
}

export const getUserByIdService = async (id) => {
  const res = await api.get(`/users/${encodeURIComponent(id)}`)
  return res.data.data
}

export const getMyProfileService = async () => {
  const res = await api.get('/users/me')
  return res.data.data
}

export const createUserService = async (data) => {
  const endpoint = data.role === 'POSH_ADMIN' ? '/auth/invite-posh-admin' : '/auth/invite'
  const res = await api.post(endpoint, data)
  return res.data.data
}

export const updateMyProfileService = async (formData) => {
  const res = await api.patch('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export const updateUserService = async (id, data) => {
  const res = await api.patch(`/users/${encodeURIComponent(id)}`, data)
  return res.data.data
}

export const deleteUserService = async (id) => {
  const res = await api.delete(`/users/${encodeURIComponent(id)}`)
  return res.data.data
}

export const changeUserRoleService = async (id, data) => {
  const res = await api.patch(`/users/${encodeURIComponent(id)}/role`, data)
  return res.data.data
}

export const toggleUserStatusService = async (id, data) => {
  const res = await api.patch(`/users/${encodeURIComponent(id)}/status`, data)
  return res.data.data
}

export const getMyDocumentsService = async () => {
  const res = await api.get('/users/me/documents')
  return res.data.data
}

import api from '@/lib/api'

export const loginService = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data.data // { accessToken, user }
}

export const getMeService = async () => {
  const res = await api.get('/auth/me')
  return res.data.data
}

export const forgotPasswordService = async ({ email }) => {
  const res = await api.post('/auth/forgot-password', { email })
  return res.data
}

export const resetPasswordService = async ({ token, password, confirmPassword }) => {
  const res = await api.post('/auth/reset-password', { token, password, confirmPassword })
  return res.data
}

export const createPasswordService = async ({ token, password, confirmPassword }) => {
  const res = await api.post('/auth/create-password', { token, password, confirmPassword })
  return res.data.data
}

export const inviteUserService = async (data) => {
  const res = await api.post('/auth/invite', data)
  return res.data.data
}

export const invitePoshAdminService = async (data) => {
  const res = await api.post('/auth/invite-posh-admin', data)
  return res.data.data
}

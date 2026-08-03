// Token & user stored in localStorage after login
export const getToken = () => localStorage.getItem('posh_token')
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('posh_user') || 'null')
  } catch {
    return null
  }
}

export const setSession = (token, user, rememberMe = false) => {
  const expiration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : null // 30 days or session
  localStorage.setItem('posh_token', token)
  localStorage.setItem('posh_user', JSON.stringify(user))
  if (expiration) {
    localStorage.setItem('posh_token_expires', Date.now() + expiration)
  } else {
    localStorage.removeItem('posh_token_expires')
  }
}

export const clearSession = () => {
  localStorage.removeItem('posh_token')
  localStorage.removeItem('posh_user')
}

// Role helpers — match backend USER_ROLES enum
export const isOwner = () => getUser()?.role === 'COMPANY_OWNER'
export const isAdmin = () => getUser()?.role === 'POSH_ADMIN'
export const isEmployee = () => getUser()?.role === 'EMPLOYEE'
export const isIcMember = () => getUser()?.role === 'IC_MEMBER'
export const isExternalMember = () => getUser()?.role === 'EXTERNAL_MEMBER'
export const isHrSpoc = () => getUser()?.role === 'HR_SPOC'
export const isLegal = () => getUser()?.role === 'LEGAL'

export const ROLE_LABELS = {
  COMPANY_OWNER: 'Company Owner',
  POSH_ADMIN: 'POSH Admin',
  EMPLOYEE: 'Employee',
  IC_MEMBER: 'IC Member',
  EXTERNAL_MEMBER: 'External Member',
  HR_SPOC: 'HR SPOC',
  LEGAL: 'Legal',
}

export const getRoleLabel = (role) => ROLE_LABELS[role] || role

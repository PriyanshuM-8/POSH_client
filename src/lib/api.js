import axios from 'axios'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach JWT ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('posh_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: handle errors globally ────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'

    if (status === 401) {
      localStorage.removeItem('posh_token')
      localStorage.removeItem('posh_user')
      // Redirect to login without full page reload
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('Access denied. You do not have permission for this action.')
    } else if (status === 404) {
      // Let individual callers handle 404
    } else if (status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

export default api

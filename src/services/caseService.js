import api from '@/lib/api'

export const getAllCasesService = async (params = {}) => {
  const res = await api.get('/cases', { params })
  return res.data.data // { cases, pagination }
}

export const getCaseByIdService = async (id) => {
  const res = await api.get(`/cases/${encodeURIComponent(id)}`)
  return res.data.data
}

export const updateCaseStatusService = async (id, data) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/status`, data)
  return res.data.data
}

export const assignCommitteeToCaseService = async (id, data) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/assign-committee`, data)
  return res.data.data
}

export const submitLegalReviewService = async (id, data) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/legal-review`, data)
  return res.data.data
}

export const recordCommitteeRecommendationService = async (id, data) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/commitee-recommendation`, data)
  return res.data.data
}

export const closeCaseService = async (id, data) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/close`, data)
  return res.data.data
}

export const reviewEvidenceService = async (id, data) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/evidence/review`, data)
  return res.data.data
}

export const reviewRecommendationService = async (id, data) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/recommendation/review`, data)
  return res.data.data
}

export const archiveCaseService = async (id) => {
  const res = await api.patch(`/cases/${encodeURIComponent(id)}/archive`)
  return res.data.data
}

export const submitFeedbackService = async (id, data) => {
  const res = await api.post(`/cases/${encodeURIComponent(id)}/feedback`, data)
  return res.data.data
}

export const downloadFinalOrderPDFService = async (id, caseId) => {
  const response = await api.get(`/cases/${encodeURIComponent(id)}/final-order/download`, {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `Final_Order_${caseId || id}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

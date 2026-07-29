const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  const type = res.headers.get('content-type') || '';
  if (type.includes('text/csv')) return res.text();
  return res.json();
}

export const api = {
  startQuiz: (payload) => request('/quiz/start', { method: 'POST', body: payload }),
  submitAnswers: (participantId, answers) =>
    request(`/quiz/${participantId}/answers`, { method: 'POST', body: { answers } }),
  submitFeedback: (participantId, feedback) =>
    request(`/quiz/${participantId}/feedback`, { method: 'POST', body: { feedback } }),
  adminLogin: (password) => request('/admin/login', { method: 'POST', body: { password } }),
  getAnalytics: (token) => request('/admin/analytics', { token }),
  getExperiences: (token) => request('/admin/experiences', { token }),
  getSessions: (token) => request('/admin/sessions', { token }),
  getSession: (token, participantId) => request(`/admin/sessions/${participantId}`, { token }),
  createExperience: (token, body) =>
    request('/admin/experiences', { method: 'POST', token, body }),
  updateExperience: (token, id, body) =>
    request(`/admin/experiences/${id}`, { method: 'PUT', token, body }),
  setExperienceStatus: (token, id, bookingStatus) =>
    request(`/admin/experiences/${id}/status`, {
      method: 'PATCH',
      token,
      body: { bookingStatus },
    }),
  exportCsv: async (token) => {
    const res = await fetch(`${API_BASE}/admin/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    return res.text();
  },
};

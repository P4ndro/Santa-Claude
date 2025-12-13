const API_BASE_URL = '/api';

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

async function refreshAccessToken() {
  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth header if we have a token
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Debug logging
  console.log(`[API] ${options.method || 'GET'} ${endpoint}`, { hasToken: !!accessToken });

  let response = await fetch(url, config);

  // If 401, try to refresh and retry once
  if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    try {
      await refreshAccessToken();
      // Retry with new token
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      response = await fetch(url, config);
    } catch {
      // Refresh failed, clear token
      clearAccessToken();
      throw new Error('Session expired');
    }
  }

  // Handle empty responses
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// API Methods
export const api = {
  // ============================================
  // AUTH
  // ============================================
  
  // Register as candidate (default)
  register: (email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: 'candidate' }),
    }),

  // Register as company
  registerCompany: (email, password, companyName) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: 'company', companyName }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  refresh: () => refreshAccessToken(),

  me: () => request('/auth/me'),

  protected: () => request('/protected'),

  // ============================================
  // CANDIDATE - INTERVIEWS
  // ============================================
  
  // Start a practice interview (no job)
  startInterview: () =>
    request('/interviews/start', { method: 'POST' }),

  // Apply to a job (start application interview)
  applyToJob: (jobId) =>
    request(`/interviews/apply/${jobId}`, { method: 'POST' }),

  getInterview: (interviewId) =>
    request(`/interviews/${interviewId}`),

  submitAnswer: (interviewId, questionId, transcript, skipped = false) =>
    request(`/interviews/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, transcript, skipped }),
    }),

  completeInterview: (interviewId) =>
    request(`/interviews/${interviewId}/complete`, { method: 'POST' }),

  getReport: (interviewId) =>
    request(`/interviews/${interviewId}/report`),

  listInterviews: () =>
    request('/interviews'),

  // ============================================
  // CANDIDATE - JOBS (browse)
  // ============================================
  
  listJobs: () =>
    request('/jobs'),

  getJob: (jobId) =>
    request(`/jobs/${jobId}`),

  // ============================================
  // CANDIDATE - USER STATS
  // ============================================
  
  getMyStats: () =>
    request('/users/me/stats'),

  // ============================================
  // COMPANY - JOBS MANAGEMENT
  // ============================================
  
  // List company's own jobs
  listMyJobs: () =>
    request('/jobs/company/my-jobs'),

  // Create a new job
  createJob: (title, rawDescription, options = {}) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify({
        title,
        rawDescription,
        location: options.location,
        locationType: options.locationType,
        employmentType: options.employmentType,
        department: options.department,
        questionConfig: options.questionConfig,
      }),
    }),

  // Update a job
  updateJob: (jobId, updates) =>
    request(`/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Delete a job
  deleteJob: (jobId) =>
    request(`/jobs/${jobId}`, { method: 'DELETE' }),

  // Generate AI questions for a job
  generateJobQuestions: (jobId) =>
    request(`/jobs/${jobId}/generate-questions`, { method: 'POST' }),

  // Publish a job
  publishJob: (jobId) =>
    request(`/jobs/${jobId}/publish`, { method: 'POST' }),

  // Get questions for a job
  getJobQuestions: (jobId) =>
    request(`/jobs/${jobId}/questions`),

  // ============================================
  // COMPANY - APPLICANTS
  // ============================================
  
  // Get all applications for company's jobs
  getApplications: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.jobId) params.append('jobId', filters.jobId);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString();
    return request(`/interviews/company/applications${query ? `?${query}` : ''}`);
  },

  // Get applicants for a specific job
  getJobApplicants: (jobId) =>
    request(`/jobs/company/${jobId}/applicants`),

  // Add notes/rating to an application
  updateApplicationNotes: (interviewId, notes, rating) =>
    request(`/interviews/${interviewId}/company-notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes, rating }),
    }),
};

export default api;


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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const api = {
  register: (email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
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
};

export default api;


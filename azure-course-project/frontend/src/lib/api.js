// Axios instance — automatically attaches the MSAL Bearer token to every request
// Module 06: Authorization header injection
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the MSAL access token before every request
// The token is stored in sessionStorage by MSAL after login
api.interceptors.request.use(async (config) => {
  try {
    // In a real app, use msalInstance.acquireTokenSilent() here
    // For now we read from sessionStorage as a simple example
    const keys = Object.keys(sessionStorage).filter((k) => k.includes('accesstoken'));
    if (keys.length > 0) {
      const tokenData = JSON.parse(sessionStorage.getItem(keys[0]));
      if (tokenData?.secret) {
        config.headers.Authorization = `Bearer ${tokenData.secret}`;
      }
    }
  } catch {
    // Not authenticated — request goes through without token
    // Protected routes on the backend will return 401
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('[API] Unauthorized — user may need to log in');
    }
    return Promise.reject(err);
  }
);

export default api;

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL as BASE_URL } from '@/lib/config/api';

const ACCESS_TOKEN_KEY  = 'topnivo_access_token';
const REFRESH_TOKEN_KEY = 'topnivo_refresh_token';

function getStoredItem(key: string) {
  if (typeof window === 'undefined') return null;

  const sessionValue = window.sessionStorage.getItem(key);
  if (sessionValue) return sessionValue;

  const localValue = window.localStorage.getItem(key);
  if (localValue) {
    window.sessionStorage.setItem(key, localValue);
  }
  return localValue;
}

function setStoredItem(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(key, value);
  window.localStorage.setItem(key, value);
}

function removeStoredItem(key: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(key);
  window.localStorage.removeItem(key);
}

// ─── Token Helpers with logging ────────────────────────────────────────────

export const tokenStorage = {
  getAccess: () => {
    const token = getStoredItem(ACCESS_TOKEN_KEY);
    if (token === 'null' || token === 'undefined') {
      removeStoredItem(ACCESS_TOKEN_KEY);
      return null;
    }
    console.log('🔑 getAccess:', token ? `${token.substring(0, 30)}...` : 'null');
    return token;
  },
  getRefresh: () => {
    const token = getStoredItem(REFRESH_TOKEN_KEY);
    if (token === 'null' || token === 'undefined') {
      removeStoredItem(REFRESH_TOKEN_KEY);
      return null;
    }
    console.log('🔑 getRefresh:', token ? `${token.substring(0, 30)}...` : 'null');
    return token;
  },
  setAccess: (t: string) => {
    console.log('🔑 setAccess:', t ? `${t.substring(0, 30)}...` : 'null');
    console.trace('setAccess called from:');
    setStoredItem(ACCESS_TOKEN_KEY, t);
  },
  setRefresh: (t: string | null | undefined) => {
    if (!t) {
      removeStoredItem(REFRESH_TOKEN_KEY);
      return;
    }
    console.log('🔑 setRefresh:', t ? `${t.substring(0, 30)}...` : 'null');
    setStoredItem(REFRESH_TOKEN_KEY, t);
  },
  setTokens: (access: string, refresh?: string | null) => {
    console.log('🔑 setTokens - Setting both tokens');
    setStoredItem(ACCESS_TOKEN_KEY, access);
    if (refresh) {
      setStoredItem(REFRESH_TOKEN_KEY, refresh);
    } else {
      removeStoredItem(REFRESH_TOKEN_KEY);
    }
  },
  clearTokens: () => {
    console.trace('🔴 clearTokens - Clearing tokens!');
    removeStoredItem(ACCESS_TOKEN_KEY);
    removeStoredItem(REFRESH_TOKEN_KEY);
    removeStoredItem('topnivo_member_id');
  },
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s — Render free tier can take 30-60s to wake from sleep
  // withCredentials: true, // ⚠️ Disable for now: Backend uses CORS wildcard '*' which breaks with credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ─── Request Interceptor with logging ─────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    // Fallback: If cookies aren't yet implemented by backend, keep using Header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ─── Response Interceptor with logging ──────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (newToken: string) => {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = (error.config ?? {}) as AxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest.url ?? 'unknown request';

    if (!error.response) {
      const reason = error.code === 'ECONNABORTED'
        ? 'Request timed out'
        : error.message || 'Network request failed';
      console.warn(`⚠️ Request failed before receiving a response: ${requestUrl} - ${reason}`);
      return Promise.reject(error);
    }

    const responseData = error.response.data;
    const hasResponseData =
      responseData &&
      (typeof responseData !== 'object' || Object.keys(responseData).length > 0);
    console.warn(`⚠️ API response error: ${error.response.status} - ${requestUrl}`);
    if (hasResponseData) {
      console.warn('API error response data:', responseData);
    }
    
    // Check if this is a 403 with a specific message
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Response data:', error.response?.data);
      // DO NOT clear tokens here - just log
      console.log('Token before returning 403:', tokenStorage.getAccess() ? 'Present' : 'Missing');
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔐 401 Unauthorized - Attempting token refresh...');
      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        console.log('No refresh token, redirecting to login');
        tokenStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log('⏳ Refresh already in progress, queueing request');
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Attempting token refresh...');
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken: string = data.access_token || data.accessToken;
        console.log('✅ Token refresh successful');
        tokenStorage.setAccess(newAccessToken);
        processQueue(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError);
        tokenStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

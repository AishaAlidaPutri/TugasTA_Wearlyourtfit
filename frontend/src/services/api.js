import { storage } from './storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect your computer's local IP address from Expo bundler
// or fallback to current Wi-Fi IP (10.111.214.139) or localhost
const getDevServerIp = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }
  return Platform.select({
    android: 'http://10.111.214.139:5000',
    default: 'http://10.111.214.139:5000',
  });
};

export const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : getDevServerIp();

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await storage.getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (isFormData) {
    // Let fetch automatically construct the multipart boundary
    delete headers['Content-Type'];
  } else {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (body && typeof body === 'object') {
      body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      body,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/api/auth/me'),

  // Home Dashboard
  getHomeSummary: () => request('/api/home/summary'),

  // Wardrobe
  getWardrobeItems: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return request(`/api/wardrobe${queryString ? `?${queryString}` : ''}`);
  },
  getWardrobeItemById: (id) => request(`/api/wardrobe/${id}`),
  createWardrobeItem: (formData) => request('/api/wardrobe', { method: 'POST', body: formData }),
  updateWardrobeItem: (id, formData) => request(`/api/wardrobe/${id}`, { method: 'PUT', body: formData }),
  deleteWardrobeItem: (id) => request(`/api/wardrobe/${id}`, { method: 'DELETE' }),

  // Outfits
  getOutfits: (params = {}) => {
    const query = new URLSearchParams();
    if (params.occasion && params.occasion !== 'All') query.append('occasion', params.occasion);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return request(`/api/outfits${queryString ? `?${queryString}` : ''}`);
  },
  getOutfitById: (id) => request(`/api/outfits/${id}`),
  createOutfit: (body) => request('/api/outfits', { method: 'POST', body: JSON.stringify(body) }),
  updateOutfit: (id, body) => request(`/api/outfits/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteOutfit: (id) => request(`/api/outfits/${id}`, { method: 'DELETE' }),

  // Schedules
  getSchedules: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.month) query.append('month', params.month);
    const queryString = query.toString();
    return request(`/api/schedules${queryString ? `?${queryString}` : ''}`);
  },
  getScheduleById: (id) => request(`/api/schedules/${id}`),
  createSchedule: (body) => request('/api/schedules', { method: 'POST', body: JSON.stringify(body) }),
  updateSchedule: (id, body) => request(`/api/schedules/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSchedule: (id) => request(`/api/schedules/${id}`, { method: 'DELETE' }),

  // User Profile
  getProfile: () => request('/api/users/me'),
  updateProfile: (formData) => request('/api/users/me', { method: 'PUT', body: formData }),
};

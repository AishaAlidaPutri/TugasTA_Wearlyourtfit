import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'wealy_user_jwt_token';
const USER_KEY = 'wealy_user_profile_data';

/**
 * Storage service with SecureStore on Native and localStorage on Web
 */
export const storage = {
  async saveToken(token) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Could not save auth token securely:', e);
    }
  },

  async getToken() {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Could not retrieve auth token:', e);
      return null;
    }
  },

  async removeToken() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Could not remove auth token:', e);
    }
  },

  async saveUser(user) {
    try {
      const serialized = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, serialized);
      } else {
        await SecureStore.setItemAsync(USER_KEY, serialized);
      }
    } catch (e) {
      console.warn('Could not save user profile:', e);
    }
  },

  async getUser() {
    try {
      let raw;
      if (Platform.OS === 'web') {
        raw = localStorage.getItem(USER_KEY);
      } else {
        raw = await SecureStore.getItemAsync(USER_KEY);
      }
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Could not retrieve user profile:', e);
      return null;
    }
  },

  async clearAll() {
    await this.removeToken();
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
  }
};

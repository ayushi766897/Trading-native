
// Storage utility to handle both React Native and web environments
let AsyncStorage: any = null;

// Try to load AsyncStorage for React Native
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // AsyncStorage is not available, we're likely in a web environment
  console.log('AsyncStorage not available, using localStorage fallback');
}

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (AsyncStorage) {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error(`Error getting item ${key} from AsyncStorage:`, error);
        return null;
      }
    } else {
      // Fallback for web environments
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          return window.localStorage.getItem(key);
        } catch (error) {
          console.error(`Error getting item ${key} from localStorage:`, error);
          return null;
        }
      }
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error(`Error setting item ${key} to AsyncStorage:`, error);
      }
    } else {
      // Fallback for web environments
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(key, value);
        } catch (error) {
          console.error(`Error setting item ${key} to localStorage:`, error);
        }
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    if (AsyncStorage) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing item ${key} from AsyncStorage:`, error);
      }
    } else {
      // Fallback for web environments
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          console.error(`Error removing item ${key} from localStorage:`, error);
        }
      }
    }
  },
};
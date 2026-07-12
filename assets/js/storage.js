/**
 * Local Storage Management
 * Handles saving and retrieving session data securely.
 */

window.StorageHelper = {
  // Prefix for all local storage keys to prevent collisions
  PREFIX: 'fci_app_',

  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  },

  get(key) {
    try {
      const serializedValue = localStorage.getItem(this.PREFIX + key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  },

  clearAll() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
};



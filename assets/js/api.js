

/**
 * API Service
 * Handles all communication with the Google Apps Script backend.
 */
window.ApiService = class ApiService {
  
  /**
   * Main request method
   * @param {string} endpoint - The action parameter string
   * @param {string} method - 'GET' or 'POST'
   * @param {object} data - Optional payload for POST requests
   * @returns {Promise<any>}
   */
  static async request(endpoint, method = 'GET', data = null) {
    const url = `${CONFIG.APPS_SCRIPT_WEB_APP_URL}${endpoint}`;
    
    // Add authentication token (User ID for MVP) to headers if available
    const session = StorageHelper.get('session');
    const headers = {
      'Content-Type': 'text/plain;charset=utf-8', // Needed for CORS with Apps Script
    };

    const options = {
      method: method,
      headers: headers,
    };

    // Note: Google Apps Script 'doPost' receives payload as plain text due to CORS,
    // so we stringify it. We inject session token inside the payload.
    if (method === 'POST') {
      const payload = data || {};
      if (session && session.token) {
        payload.authToken = session.token; 
      }
      options.body = JSON.stringify(payload);
    } else if (method === 'GET' && session && session.token) {
      // Append token to GET request URL
      options.url = `${url}&token=${encodeURIComponent(session.token)}`;
    }

    try {
      const fetchUrl = options.url || url;
      const response = await fetch(fetchUrl, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Standardize response validation based on requirements
      if (!result.success) {
        throw new Error(result.error || result.message || 'API request failed');
      }

      // Return user if it exists (for login), otherwise return data
      return result.user || result.data || result;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // --- Specific API Calls ---

  static async login(employeeId, password) {
    return this.request(API_ENDPOINTS.LOGIN, 'POST', { username: employeeId, password: password });
  }

  static async getDashboard() {
    const user = window.Auth.getUser();
    const qs = user ? `&userId=${user.id}` : '';
    return this.request(API_ENDPOINTS.GET_DASHBOARD + qs, 'GET');
  }

  static async signup(payload) {
    return this.request('?action=signup', 'POST', payload);
  }

  // LMS Phase 1: User Management
  static async getUsers() {
    return this.request('?action=getUsersList', 'GET');
  }

  static async addUser(userData) {
    userData.action = 'adminAddUser';
    return this.request('?action=adminAddUser', 'POST', userData);
  }

  static async removeUser(userId) {
    return this.request('?action=adminRemoveUser', 'POST', { userId });
  }
}



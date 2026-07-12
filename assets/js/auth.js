

/**
 * Authentication Management
 * Handles login, logout, and session validation.
 */
window.Auth = class Auth {
  
  /**
   * Initializes auth state, checking for existing session
   */
  static init() {
    this.session = StorageHelper.get('session');
  }

  /**
   * Checks if user is currently logged in
   * @returns {boolean}
   */
  static isAuthenticated() {
    return !!this.session && !!this.session.token;
  }

  /**
   * Gets current user data
   * @returns {object|null}
   */
  static getUser() {
    return this.session ? this.session.user : null;
  }

  /**
   * Performs login
   * @param {string} employeeId 
   * @param {string} password 
   * @param {boolean} rememberMe 
   */
  static async login(employeeId, password, rememberMe = false) {
    try {
      // Call the real Google Apps Script backend
      const result = await ApiService.login(employeeId, password);
      
      const sessionData = {
        token: 'active-session-' + result.id,
        user: result
      };
      
      this.session = sessionData;
      StorageHelper.set('session', sessionData);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logs out the user
   */
  static logout() {
    this.session = null;
    StorageHelper.remove('session');
    // Redirect to login page
    window.location.href = 'login.html';
  }

  /**
   * Middleware to protect routes
   * Redirects to login if not authenticated
   */
  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
}

// Initialize on load
Auth.init();



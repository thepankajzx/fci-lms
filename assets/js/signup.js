document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const errorMsg = document.getElementById('errorMessage');
  const btn = document.getElementById('signupBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';
      
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const department = document.getElementById('department').value;

      btn.disabled = true;
      btn.textContent = 'Creating account...';

      try {
        const payload = {
          action: 'signup',
          firstName,
          lastName,
          email,
          password,
          department,
          role: 'Employee'
        };

        const result = await ApiService.request('?action=signup', 'POST', payload);
        
        if (result && result.id) {
          // Bypass second API call to avoid Google Sheets async write delay (race condition)
          const sessionData = {
            token: 'active-session-' + result.id,
            user: result
          };
          window.Auth.session = sessionData;
          window.StorageHelper.set('session', sessionData);
          
          window.location.href = 'dashboard.html';
        }
      } catch (error) {
        errorMsg.textContent = 'Failed to create account: ' + error.message;
        errorMsg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Sign Up';
      }
    });
  }
});

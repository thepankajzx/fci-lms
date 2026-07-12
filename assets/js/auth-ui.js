document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('showLoginBtn');
  const signupBtn = document.getElementById('showSignupBtn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');

  // Toggle Forms
  loginBtn.addEventListener('click', () => {
    loginBtn.classList.add('active');
    signupBtn.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    authTitle.textContent = 'Welcome back';
    authSubtitle.textContent = 'Sign in to your account.';
  });

  signupBtn.addEventListener('click', () => {
    signupBtn.classList.add('active');
    loginBtn.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Join your organization\'s workspace.';
  });

  // Handle Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginSubmitBtn');
    const err = document.getElementById('loginError');
    
    btn.textContent = 'Signing in...';
    err.style.display = 'none';

    try {
      // Auth.login will throw if credentials are bad
      const user = await window.Auth.login(email, pass);
      
      // Role Check
      if (role === 'Admin' && user.role !== 'Admin' && user.role !== 'HR') {
        // Log them out locally since we reject them
        window.Auth.session = null;
        window.StorageHelper.remove('session');
        throw new Error("You do not have Administrator privileges.");
      }

      // Route based on role is now handled globally on index.html
      // Just redirect everyone to the landing page
      window.location.href = 'index.html';
    } catch (error) {
      err.textContent = error.message;
      err.style.display = 'block';
      btn.textContent = 'Sign In';
    }
  });

  // Handle Signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const department = document.getElementById('department').value;
    const btn = document.getElementById('signupSubmitBtn');
    const err = document.getElementById('signupError');
    
    btn.textContent = 'Creating...';
    err.style.display = 'none';

    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
        department,
        role: email === 'admin@fci.com' ? 'Admin' : 'Employee'
      };

      const result = await window.ApiService.signup(payload);
      
      if (result && result.id) {
        const sessionData = {
          token: 'active-session-' + result.id,
          user: result
        };
        window.Auth.session = sessionData;
        window.StorageHelper.set('session', sessionData);
        
        // Auto-route to landing page
        window.location.href = 'index.html';
      }
    } catch (error) {
      err.textContent = 'Failed to create account: ' + (error.message || 'Unknown error');
      err.style.display = 'block';
      btn.textContent = 'Create Account';
    }
  });
});

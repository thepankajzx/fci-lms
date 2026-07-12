

window.DashboardController = class DashboardController {
  
  static async init() {
    const user = window.Auth.getUser();
    if (user && (user.role === 'Admin' || user.role === 'HR')) {
      window.location.href = 'admin.html';
      return;
    }
    
    this.bindEvents();
    this.renderUserInfo();
    await this.loadDashboardData();
  }

  static bindEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => Auth.logout());
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  }

  static renderUserInfo() {
    const user = window.Auth.getUser();
    if (user) {
      document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
      document.getElementById('userRole').textContent = user.department || user.role;
      document.getElementById('userAvatar').textContent = user.firstName.charAt(0);
      document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.firstName}!`;

      // Inject Admin Panel link if user is Admin or HR
      if (user.role === 'Admin' || user.role === 'HR') {
        const nav = document.querySelector('.sidebar-nav');
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.className = 'nav-item';
        adminLink.innerHTML = `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> Admin Panel`;
        nav.appendChild(adminLink);
      }
    }
  }

  static async loadDashboardData() {
    try {
      // Mock delay for loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const data = await ApiService.getDashboard();
      
      this.updateStats(data);
      this.renderPendingTasks(data.pendingTasks || []);

    } catch (error) {
      console.error('Failed to load dashboard', error);
      // Fallback mockup data if API isn't deployed yet
      this.updateStats({ progress: 25, assigned: 3, completed: 1, pending: 2 });
      this.renderPendingTasks([
        { id: 'A1', name: 'Financial Confidence Baseline', time: '10 mins' },
        { id: 'A2', name: 'Budgeting Habits', time: '15 mins' }
      ]);
    }
  }

  static updateStats(data) {
    document.getElementById('statAssigned').textContent = data.assigned;
    document.getElementById('statCompleted').textContent = data.completed;
    document.getElementById('statPending').textContent = data.assigned - data.completed;
    
    // Update progress pie chart
    const ctx = document.getElementById('progressChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Pending'],
          datasets: [{
            data: [data.completed, data.assigned - data.completed],
            backgroundColor: ['#10B981', '#3B82F6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#ffffff' }
            }
          }
        }
      });
    }
  }

  static renderPendingTasks(tasks) {
    const list = document.getElementById('pendingList');
    if (!list) return;

    if (tasks.length === 0) {
      list.innerHTML = `<div class="activity-empty text-center" style="padding: 2rem; color: var(--color-text-tertiary);">You have completed all assigned tasks!</div>`;
      return;
    }

    list.innerHTML = tasks.map(task => `
      <div class="assessment-task-card">
        <div class="task-info">
          <h4>${task.name}</h4>
          <p class="text-tertiary">Estimated time: ${task.time}</p>
        </div>
        <a href="assessment.html?id=${task.id}" class="btn-sm">Start</a>
      </div>
    `).join('');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  DashboardController.init();
});

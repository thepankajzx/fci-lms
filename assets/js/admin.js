class AdminController {
  
  static async init() {
    this.bindEvents();
    await this.loadOverviewData();
  }

  static bindEvents() {
    // Navigation Tabs
    const navOverview = document.getElementById('navOverview');
    const navManageUsers = document.getElementById('navManageUsers');
    const navManageCourses = document.getElementById('navManageCourses');

    const viewOverview = document.getElementById('viewOverview');
    const viewManageUsers = document.getElementById('viewManageUsers');
    const viewManageCourses = document.getElementById('viewManageCourses');

    const switchTab = (activeNav, activeView, loadDataFn) => {
      [navOverview, navManageUsers, navManageCourses].forEach(n => n.classList.remove('active'));
      [viewOverview, viewManageUsers, viewManageCourses].forEach(v => v.style.display = 'none');
      
      activeNav.classList.add('active');
      activeView.style.display = 'block';
      
      if (loadDataFn) loadDataFn();
    };

    navOverview.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(navOverview, viewOverview, () => this.loadOverviewData());
    });

    navManageUsers.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(navManageUsers, viewManageUsers, () => this.loadUsersDirectory());
    });

    navManageCourses.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(navManageCourses, viewManageCourses, null); // Placeholder for now
    });

    // Add User Modal
    const modal = document.getElementById('addUserModal');
    document.getElementById('openAddUserModalBtn').addEventListener('click', () => {
      modal.style.display = 'flex';
      setTimeout(() => modal.style.opacity = '1', 10);
      modal.style.pointerEvents = 'auto';
    });

    const closeModal = () => {
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
      setTimeout(() => modal.style.display = 'none', 300);
      document.getElementById('addUserForm').reset();
    };

    document.getElementById('closeAddUserBtn').addEventListener('click', closeModal);

    // Add User Form Submission
    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitAddUserBtn');
      const err = document.getElementById('addUserError');
      btn.textContent = 'Creating...';
      err.style.display = 'none';

      const payload = {
        firstName: document.getElementById('addFirstName').value,
        lastName: document.getElementById('addLastName').value,
        email: document.getElementById('addEmail').value,
        password: document.getElementById('addPassword').value,
        role: document.getElementById('addRole').value,
        department: document.getElementById('addDept').value,
      };

      try {
        await window.ApiService.addUser(payload);
        closeModal();
        await this.loadUsersDirectory(); // refresh list
      } catch (error) {
        err.textContent = 'Error: ' + error.message;
        err.style.display = 'block';
      } finally {
        btn.textContent = 'Create User';
      }
    });
  }

  // --- OVERVIEW TAB ---
  static async loadOverviewData() {
    try {
      const data = await window.ApiService.getAdminData();
      
      document.getElementById('totalUsers').textContent = data.totalUsers || 0;
      document.getElementById('totalCompleted').textContent = data.totalCompleted || 0;
      document.getElementById('avgScore').textContent = data.avgScore ? data.avgScore + '%' : '0%';

      const tbody = document.getElementById('completionTableBody');
      if (data.recentActivity && data.recentActivity.length > 0) {
        tbody.innerHTML = data.recentActivity.map(item => `
          <tr>
            <td>
              <div class="font-medium">${item.name}</div>
            </td>
            <td>${item.dept}</td>
            <td><span class="status-badge" style="background: var(--color-primary-light); color: var(--color-primary);">${item.assessment}</span></td>
            <td class="font-bold">${item.score}%</td>
            <td>${item.profile}</td>
            <td class="text-secondary">${item.date}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-tertiary" style="padding: 2rem;">No recent completions found.</td></tr>`;
      }
    } catch (error) {
      console.error('Failed to load overview data', error);
      document.getElementById('completionTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-danger" style="padding: 2rem;">Error loading data: ${error.message}</td></tr>`;
    }
  }

  // --- MANAGE USERS TAB ---
  static async loadUsersDirectory() {
    const tbody = document.getElementById('userDirectoryBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2rem;">Loading users...</td></tr>`;

    try {
      const data = await window.ApiService.getUsers();
      if (data && data.users && data.users.length > 0) {
        tbody.innerHTML = data.users.map(user => `
          <tr>
            <td>${user.id}</td>
            <td class="font-medium">${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td><span class="status-badge" style="background: ${user.role === 'Admin' ? 'var(--color-danger-light)' : 'var(--color-primary-light)'}; color: ${user.role === 'Admin' ? 'var(--color-danger)' : 'var(--color-primary)'};">${user.role}</span></td>
            <td>${user.department}</td>
            <td>
              ${user.id !== 'U0' ? `<button class="btn-sm" style="background: var(--color-danger-light); color: var(--color-danger);" onclick="AdminController.deleteUser('${user.id}')">Delete</button>` : '-'}
            </td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-tertiary" style="padding: 2rem;">No users found.</td></tr>`;
      }
    } catch (error) {
      console.error('Failed to load user directory', error);
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger" style="padding: 2rem;">Error loading users: ${error.message}</td></tr>`;
    }
  }

  static async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await window.ApiService.removeUser(userId);
      await this.loadUsersDirectory(); // refresh list
    } catch (error) {
      alert('Failed to delete user: ' + error.message);
    }
  }
}

// Global expose for inline onclick handlers
window.AdminController = AdminController;

document.addEventListener('DOMContentLoaded', () => {
  AdminController.init();
});

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
      switchTab(navManageCourses, viewManageCourses, () => this.loadCoursesDirectory());
      document.getElementById('viewCourseBuilder').style.display = 'none';
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

    // --- Course Builder UI Setup ---
    this.courseQuestions = [];
    
    document.getElementById('openCourseBuilderBtn').addEventListener('click', () => {
      document.getElementById('viewManageCourses').style.display = 'none';
      document.getElementById('viewCourseBuilder').style.display = 'block';
      document.getElementById('courseBuilderForm').reset();
      this.courseQuestions = [];
      this.renderQuestions();
    });

    document.getElementById('backToCoursesBtn').addEventListener('click', () => {
      document.getElementById('viewCourseBuilder').style.display = 'none';
      document.getElementById('viewManageCourses').style.display = 'block';
      this.loadCoursesDirectory();
    });

    document.getElementById('cancelCourseBtn').addEventListener('click', () => {
      document.getElementById('backToCoursesBtn').click();
    });

    document.getElementById('addQuestionBtn').addEventListener('click', () => {
      this.courseQuestions.push({
        text: '',
        type: 'single',
        weight: 10,
        options: [{text: '', weight: 0}, {text: '', weight: 0}]
      });
      this.renderQuestions();
    });

    document.getElementById('courseBuilderForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('saveCourseBtn');
      btn.textContent = 'Publishing...';
      
      const payload = {
        course: {
          name: document.getElementById('cbTitle').value,
          category: document.getElementById('cbCategory').value,
          description: document.getElementById('cbDescription').value
        },
        questions: this.courseQuestions
      };

      try {
        await window.ApiService.addCourse(payload);
        document.getElementById('backToCoursesBtn').click();
      } catch (error) {
        alert('Error creating course: ' + error.message);
      } finally {
        btn.textContent = 'Publish Course';
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

  // --- MANAGE COURSES TAB & BUILDER ---
  static async loadCoursesDirectory() {
    const tbody = document.getElementById('courseDirectoryBody');
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 2rem;">Loading courses...</td></tr>`;

    try {
      const res = await window.ApiService.getCourses();
      if (res && res.courses && res.courses.length > 0) {
        tbody.innerHTML = res.courses.map(course => `
          <tr>
            <td>${course.id}</td>
            <td class="font-medium">${course.name}</td>
            <td>${course.category}</td>
            <td><span class="status-badge" style="background: var(--color-success-light); color: var(--color-success);">${course.status}</span></td>
            <td>
              <button class="btn-sm" style="background: var(--color-danger-light); color: var(--color-danger);" onclick="AdminController.deleteCourse('${course.id}')">Delete</button>
            </td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-tertiary" style="padding: 2rem;">No courses found.</td></tr>`;
      }
    } catch (error) {
      console.error('Failed to load courses', error);
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger" style="padding: 2rem;">Error loading courses: ${error.message}</td></tr>`;
    }
  }

  static async deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await window.ApiService.deleteCourse(courseId);
      await this.loadCoursesDirectory();
    } catch (error) {
      alert('Failed to delete course: ' + error.message);
    }
  }

  static renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    this.courseQuestions.forEach((q, qIndex) => {
      const qDiv = document.createElement('div');
      qDiv.style.border = '1px solid var(--color-border)';
      qDiv.style.borderRadius = 'var(--radius-sm)';
      qDiv.style.padding = '16px';
      
      let optionsHTML = '';
      q.options.forEach((opt, oIndex) => {
        optionsHTML += `
          <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
            <input type="text" class="form-input" style="flex: 1;" placeholder="Option text" value="${opt.text}" onchange="AdminController.updateOption(${qIndex}, ${oIndex}, 'text', this.value)">
            <input type="number" class="form-input" style="width: 80px;" placeholder="Score" value="${opt.weight}" onchange="AdminController.updateOption(${qIndex}, ${oIndex}, 'weight', this.value)">
            <button type="button" class="btn-secondary" style="padding: 4px 8px;" onclick="AdminController.removeOption(${qIndex}, ${oIndex})">X</button>
          </div>
        `;
      });

      qDiv.innerHTML = `
        <div class="flex justify-between items-center" style="margin-bottom: 12px;">
          <h5 style="margin: 0;">Question ${qIndex + 1}</h5>
          <button type="button" class="btn-sm" style="background: var(--color-danger-light); color: var(--color-danger);" onclick="AdminController.removeQuestion(${qIndex})">Remove</button>
        </div>
        <input type="text" class="form-input" style="margin-bottom: 12px;" placeholder="Enter question text..." value="${q.text}" onchange="AdminController.updateQuestion(${qIndex}, 'text', this.value)">
        
        <div style="margin-bottom: 8px;"><strong style="font-size: 0.875rem;">Options</strong></div>
        <div id="optionsContainer-${qIndex}">
          ${optionsHTML}
        </div>
        <button type="button" class="btn-secondary" style="font-size: 0.75rem; padding: 4px 8px; margin-top: 4px;" onclick="AdminController.addOption(${qIndex})">+ Add Option</button>
      `;
      container.appendChild(qDiv);
    });
  }

  static updateQuestion(qIndex, field, value) {
    this.courseQuestions[qIndex][field] = value;
  }

  static updateOption(qIndex, oIndex, field, value) {
    this.courseQuestions[qIndex].options[oIndex][field] = field === 'weight' ? Number(value) : value;
  }

  static addOption(qIndex) {
    this.courseQuestions[qIndex].options.push({text: '', weight: 0});
    this.renderQuestions();
  }

  static removeOption(qIndex, oIndex) {
    this.courseQuestions[qIndex].options.splice(oIndex, 1);
    this.renderQuestions();
  }

  static removeQuestion(qIndex) {
    this.courseQuestions.splice(qIndex, 1);
    this.renderQuestions();
  }
}

// Global expose for inline onclick handlers
window.AdminController = AdminController;

document.addEventListener('DOMContentLoaded', () => {
  AdminController.init();
});

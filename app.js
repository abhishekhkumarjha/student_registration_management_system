// API Base URL
const API_BASE_URL = '/api';

// State
let isLoggedIn = false;
let currentUser = null;
let students = [];
let currentView = 'login';
let editingStudent = null;
let adminProfile = null;
let isDarkMode = false;

// DOM Elements
const app = document.getElementById('app');

// Initialize app
function init() {
  checkLoginStatus();
  loadThemePreference();
  render();
}

// Load theme preference from localStorage
function loadThemePreference() {
  isDarkMode = localStorage.getItem('srs_dark_mode') === 'true';
  applyTheme();
}

// Apply theme to documen
function applyTheme() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Toggle theme
function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('srs_dark_mode', isDarkMode ? 'true' : 'false');
  applyTheme();
}

// Check login status from localStorage
function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('srs_logged_in') === 'true';
  currentUser = localStorage.getItem('srs_current_user');

  if (isLoggedIn && currentUser) {
    currentView = 'dashboard';
    loadAdminData();
  } else {
    currentView = 'login';
  }
}

// API Helper Functions
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Server request failed');
  }

  return payload;
}

// Auth Functions
async function login(username, password) {
  const payload = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  isLoggedIn = true;
  currentUser = payload.admin.username;
  adminProfile = payload.admin;
  localStorage.setItem('srs_logged_in', 'true');
  localStorage.setItem('srs_current_user', currentUser);

  await loadStudents();
  currentView = 'dashboard';
  render();
}

async function logout() {
  try {
    await apiRequest('/logout', { method: 'POST' });
  } catch (error) {
    console.warn('Server logout failed');
  }

  isLoggedIn = false;
  currentUser = null;
  adminProfile = null;
  students = [];
  localStorage.removeItem('srs_logged_in');
  localStorage.removeItem('srs_current_user');

  currentView = 'login';
  render();
}

async function loadAdminData() {
  try {
    const payload = await apiRequest('/admin');
    adminProfile = payload.admin;
  } catch (error) {
    console.error('Failed to load admin data:', error);
  }
}

async function loadStudents() {
  try {
    const payload = await apiRequest('/students');
    students = payload.students;
  } catch (error) {
    console.error('Failed to load students:', error);
    showAlert('Failed to load students', 'danger');
  }
}

// Student CRUD Operations
async function createStudent(studentData) {
  const payload = await apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });

  students.unshift(payload.student);
  showAlert('Student added successfully', 'success');
  currentView = 'students';
  render();
}

async function updateStudent(id, studentData) {
  const payload = await apiRequest(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });

  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = payload.student;
  }

  editingStudent = null;
  showAlert('Student updated successfully', 'success');
  currentView = 'students';
  render();
}

async function deleteStudent(id) {
  await apiRequest(`/students/${id}`, { method: 'DELETE' });

  students = students.filter(s => s.id !== id);
  showAlert('Student deleted successfully', 'success');
  render();
}

async function resetStudents() {
  const payload = await apiRequest('/students/reset', { method: 'POST' });
  students = payload.students;
  showAlert('Database reset successfully', 'success');
  render();
}

async function changePassword(currentPassword, newPassword) {
  await apiRequest('/admin/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  showAlert('Password changed successfully', 'success');
}

async function exportDatabase() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "student_registry_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

async function importDatabase(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(s => s.roll_no && s.name && s.school && s.department);
          if (isValid) {
            const payload = await apiRequest('/students/import', {
              method: 'POST',
              body: JSON.stringify(parsed),
            });
            students = payload.students;
            showAlert('Students imported successfully', 'success');
            resolve();
            return;
          }
        }
        reject(new Error('Invalid JSON format'));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}

// Utility Functions
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  const container = document.querySelector('.content-area') || document.querySelector('.login-container');
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Render Functions
function render() {
  if (currentView === 'login') {
    renderLogin();
  } else {
    renderDashboard();
  }
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-container">
      <button class="btn btn-outline-light position-absolute top-0 end-0 m-3" id="loginThemeToggle" style="z-index: 10;">
        <span id="loginThemeIcon">${isDarkMode ? '☀️' : '🌙'}</span>
      </button>
      <div class="card login-card">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <div class="display-1 mb-3 float">🎓</div>
            <h3 class="card-title fw-bold display-6">Student Registry System</h3>
            <p class="text-muted">Secure Administrator Access</p>
          </div>

          <form id="loginForm">
            <div class="mb-3">
              <label for="username" class="form-label">👤 Username</label>
              <input type="text" class="form-control" id="username" value="admin" required>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">🔒 Password</label>
              <input type="password" class="form-control" id="password" value="admin123" required>
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary btn-lg">
                <span class="me-2">🚀</span> Login
              </button>
              <button type="button" class="btn btn-outline-secondary" id="resetBtn">
                <span class="me-2">🔄</span> Rese
              </button>
            </div>
          </form>

          <div class="mt-4 p-3 bg-light rounded">
            <h6 class="fw-bold mb-2">🔑 Demo Access Credentials</h6>
            <div class="small">
              <div><strong>Username:</strong> admin</div>
              <div><strong>Password:</strong> admin123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('loginThemeToggle').addEventListener('click', () => {
    toggleTheme();
    render();
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      await login(username, password);
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  });
}

function renderDashboard() {
  app.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Student Registration Management System</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link ${currentView === 'overview' ? 'active' : ''}" href="#" data-view="overview">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${currentView === 'students' ? 'active' : ''}" href="#" data-view="students">View Students</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${currentView === 'add' ? 'active' : ''}" href="#" data-view="add">Add Student</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${currentView === 'settings' ? 'active' : ''}" href="#" data-view="settings">Settings</a>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-light btn-sm" id="themeToggleBtn" title="Toggle Theme">
              <span id="themeIcon">${isDarkMode ? '☀️' : '🌙'}</span>
            </button>
            <span class="text-white">Welcome, ${currentUser}</span>
            <button class="btn btn-outline-light btn-sm" id="logoutBtn">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12 content-area">
          ${renderContent()}
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      currentView = e.target.dataset.view;
      editingStudent = null;
      render();
    });
  });

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    toggleTheme();
    render(); // Re-render to update theme icon
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);

  // View-specific event listeners
  if (currentView === 'add') {
    setupStudentForm();
  }
  if (currentView === 'students') {
    setupStudentList();
  }
  if (currentView === 'settings') {
    setupSettings();
  }
}

function renderContent() {
  switch (currentView) {
    case 'overview':
      return renderOverview();
    case 'students':
      return renderStudentList();
    case 'add':
      return renderStudentForm();
    case 'settings':
      return renderSettings();
    default:
      return renderOverview();
  }
}

function renderOverview() {
  const totalStudents = students.length;
  const departments = [...new Set(students.map(s => s.department))];

  return `
    <div class="text-center mb-5">
      <h2 class="display-4 fw-bold mb-3">🎓 Dashboard Overview</h2>
      <p class="lead text-muted">Welcome to your Student Registration Management System</p>
    </div>

    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card dashboard-card pulse">
          <div class="card-body text-center">
            <div class="display-1 mb-3">👨‍🎓</div>
            <h5 class="card-title fw-bold">Total Students</h5>
            <p class="card-text display-4 fw-bold text-primary">${totalStudents}</p>
            <p class="text-muted small">Registered students</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card dashboard-card pulse" style="animation-delay: 0.2s">
          <div class="card-body text-center">
            <div class="display-1 mb-3">🏫</div>
            <h5 class="card-title fw-bold">Departments</h5>
            <p class="card-text display-4 fw-bold text-success">${departments.length}</p>
            <p class="text-muted small">Academic departments</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card dashboard-card pulse" style="animation-delay: 0.4s">
          <div class="card-body text-center">
            <div class="display-1 mb-3">🗄️</div>
            <h5 class="card-title fw-bold">Database Status</h5>
            <p class="card-text display-6 fw-bold text-info">Connected</p>
            <p class="text-muted small">MongoDB active</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card dashboard-card">
          <div class="card-header">
            <h5 class="mb-0">📊 Quick Statistics</h5>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-6 mb-3">
                <div class="display-6 fw-bold text-primary">${totalStudents}</div>
                <div class="text-muted">Total Records</div>
              </div>
              <div class="col-6 mb-3">
                <div class="display-6 fw-bold text-success">${departments.length}</div>
                <div class="text-muted">Departments</div>
              </div>
              <div class="col-6">
                <div class="display-6 fw-bold text-info">100%</div>
                <div class="text-muted">System Uptime</div>
              </div>
              <div class="col-6">
                <div class="display-6 fw-bold text-warning">24/7</div>
                <div class="text-muted">Availability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card dashboard-card">
          <div class="card-header">
            <h5 class="mb-0">⚡ Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-3">
              <button class="btn btn-primary btn-lg" data-view="add">
                <span class="me-2">➕</span> Add New Studen
              </button>
              <button class="btn btn-success btn-lg" data-view="students">
                <span class="me-2">📋</span> View All Students
              </button>
              <button class="btn btn-info btn-lg" data-view="settings">
                <span class="me-2">⚙️</span> System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card dashboard-card">
      <div class="card-header">
        <h5 class="mb-0">📈 Recent Activity</h5>
      </div>
      <div class="card-body">
        <div class="d-flex align-items-center mb-3">
          <div class="flex-shrink-0">
            <span class="display-6">🔔</span>
          </div>
          <div class="flex-grow-1 ms-3">
            <h6 class="mb-1 fw-bold">System Ready</h6>
            <p class="mb-0 text-muted small">All systems operational. Database connection established successfully.</p>
          </div>
          <div class="flex-shrink-0">
            <span class="badge bg-success">Active</span>
          </div>
        </div>
        <hr>
        <div class="d-flex align-items-center">
          <div class="flex-shrink-0">
            <span class="display-6">👤</span>
          </div>
          <div class="flex-grow-1 ms-3">
            <h6 class="mb-1 fw-bold">Admin Logged In</h6>
            <p class="mb-0 text-muted small">Welcome back, ${currentUser || 'Administrator'}</p>
          </div>
          <div class="flex-shrink-0">
            <span class="badge bg-primary">Online</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStudentList() {
  return `
    <div class="text-center mb-4">
      <h2 class="display-5 fw-bold mb-2">📋 Student List</h2>
      <p class="text-muted">Manage and view all registered students</p>
    </div>

    <div class="card dashboard-card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-primary text-white">🔍</span>
              <input type="text" class="form-control" id="searchInput" placeholder="Search by roll number, name, or department...">
            </div>
          </div>
          <div class="col-md-6">
            <button class="btn btn-primary btn-lg w-100" id="addStudentBtn">
              <span class="me-2">➕</span> Add New Studen
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card dashboard-card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>🆔 ID</th>
                <th>📝 Roll No</th>
                <th>👤 Name</th>
                <th>🏢 Department</th>
                <th>🏫 School</th>
                <th>📧 Email</th>
                <th>📱 Mobile</th>
                <th>⚙️ Actions</th>
              </tr>
            </thead>
            <tbody id="studentTableBody">
              ${students.map(student => `
                <tr>
                  <td><span class="badge bg-primary">${student.student_id}</span></td>
                  <td><strong>${student.roll_no}</strong></td>
                  <td>${student.name}</td>
                  <td><span class="badge bg-info">${student.department}</span></td>
                  <td>${student.school}</td>
                  <td>${student.email}</td>
                  <td>${student.mobile}</td>
                  <td>
                    <button class="btn btn-sm btn-info me-1 edit-btn" data-id="${student.id}">
                      <span>✏️</span> Edi
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${student.id}">
                      <span>🗑️</span> Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${students.length === 0 ? `
          <div class="text-center py-5">
            <div class="display-1 mb-3">📭</div>
            <h5 class="text-muted">No students found</h5>
            <p class="text-muted small">Add your first student to get started</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function setupStudentList() {
  document.getElementById('addStudentBtn').addEventListener('click', () => {
    currentView = 'add';
    editingStudent = null;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = students.filter(s =>
      s.roll_no.toLowerCase().includes(searchTerm) ||
      s.name.toLowerCase().includes(searchTerm) ||
      s.department.toLowerCase().includes(searchTerm)
    );

    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = filtered.map(student => `
      <tr>
        <td>${student.student_id}</td>
        <td>${student.roll_no}</td>
        <td>${student.name}</td>
        <td>${student.department}</td>
        <td>${student.school}</td>
        <td>${student.email}</td>
        <td>${student.mobile}</td>
        <td>
          <button class="btn btn-sm btn-info edit-btn" data-id="${student.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${student.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    setupStudentListButtons();
  });

  setupStudentListButtons();
}

function setupStudentListButtons() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      editingStudent = students.find(s => s.id === id);
      currentView = 'add';
      render();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this student?')) {
        deleteStudent(id);
      }
    });
  });
}

function renderStudentForm() {
  const student = editingStudent || {};

  return `
    <div class="text-center mb-4">
      <h2 class="display-5 fw-bold mb-2">${editingStudent ? '✏️ Edit Student' : '➕ Add New Student'}</h2>
      <p class="text-muted">${editingStudent ? 'Update student information' : 'Register a new student'}</p>
    </div>

    <div class="card dashboard-card">
      <div class="card-body">
        <form id="studentForm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="roll_no" class="form-label">📝 Roll Number *</label>
              <input type="text" class="form-control" id="roll_no" value="${student.roll_no || ''}" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="name" class="form-label">👤 Name *</label>
              <input type="text" class="form-control" id="name" value="${student.name || ''}" required>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="department" class="form-label">🏢 Department *</label>
              <select class="form-control" id="department" required>
                <option value="">Select Department</option>
                <option value="CSE" ${student.department === 'CSE' ? 'selected' : ''}>Computer Science & Engineering (CSE)</option>
                <option value="ECE" ${student.department === 'ECE' ? 'selected' : ''}>Electronics & Communication (ECE)</option>
                <option value="EEE" ${student.department === 'EEE' ? 'selected' : ''}>Electrical & Electronics (EEE)</option>
                <option value="MECH" ${student.department === 'MECH' ? 'selected' : ''}>Mechanical Engineering (MECH)</option>
                <option value="CIVIL" ${student.department === 'CIVIL' ? 'selected' : ''}>Civil Engineering (CIVIL)</option>
                <option value="IT" ${student.department === 'IT' ? 'selected' : ''}>Information Technology (IT)</option>
                <option value="AERO" ${student.department === 'AERO' ? 'selected' : ''}>Aerospace Engineering (AERO)</option>
                <option value="BIO" ${student.department === 'BIO' ? 'selected' : ''}>Biotechnology (BIO)</option>
                <option value="CHEM" ${student.department === 'CHEM' ? 'selected' : ''}>Chemical Engineering (CHEM)</option>
                <option value="MME" ${student.department === 'MME' ? 'selected' : ''}>Metallurgical & Materials (MME)</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label for="school" class="form-label">🏫 School *</label>
              <input type="text" class="form-control" id="school" value="${student.school || ''}" required>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">📧 Email *</label>
              <input type="email" class="form-control" id="email" value="${student.email || ''}" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="mobile" class="form-label">📱 Mobile *</label>
              <input type="text" class="form-control" id="mobile" value="${student.mobile || ''}" required>
            </div>
          </div>

          <div class="mb-3">
            <label for="address" class="form-label">🏠 Address *</label>
            <textarea class="form-control" id="address" rows="3" required>${student.address || ''}</textarea>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary btn-lg flex-grow-1">
              <span class="me-2">${editingStudent ? '💾' : '✅'}</span> ${editingStudent ? 'Update' : 'Save'}
            </button>
            <button type="button" class="btn btn-secondary btn-lg" id="cancelBtn">
              <span class="me-2">❌</span> Cancel
            </button>
            <button type="button" class="btn btn-outline-secondary btn-lg" id="resetFormBtn">
              <span class="me-2">🔄</span> Rese
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function setupStudentForm() {
  document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
      roll_no: document.getElementById('roll_no').value,
      name: document.getElementById('name').value,
      department: document.getElementById('department').value,
      school: document.getElementById('school').value,
      email: document.getElementById('email').value,
      mobile: document.getElementById('mobile').value,
      address: document.getElementById('address').value,
    };

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, studentData);
      } else {
        await createStudent(studentData);
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  });

  document.getElementById('cancelBtn').addEventListener('click', () => {
    editingStudent = null;
    currentView = 'students';
    render();
  });

  document.getElementById('resetFormBtn').addEventListener('click', () => {
    document.getElementById('studentForm').reset();
  });
}

function renderSettings() {
  return `
    <div class="text-center mb-4">
      <h2 class="display-5 fw-bold mb-2">⚙️ Settings</h2>
      <p class="text-muted">Manage system configuration and database</p>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card dashboard-card mb-4">
          <div class="card-header">
            <h5 class="mb-0">🔐 Change Password</h5>
          </div>
          <div class="card-body">
            <form id="passwordForm">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">🔑 Current Password</label>
                <input type="password" class="form-control" id="currentPassword" required>
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">🆕 New Password</label>
                <input type="password" class="form-control" id="newPassword" required minlength="5">
              </div>
              <button type="submit" class="btn btn-primary btn-lg w-100">
                <span class="me-2">🔄</span> Change Password
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card dashboard-card mb-4">
          <div class="card-header">
            <h5 class="mb-0">🗄️ Database Management</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-3">
              <button class="btn btn-success btn-lg" id="exportBtn">
                <span class="me-2">📥</span> Export Database
              </button>
              <button class="btn btn-info btn-lg" id="importBtn">
                <span class="me-2">📤</span> Import Database
              </button>
              <input type="file" id="importFile" accept=".json" class="d-none">
              <button class="btn btn-danger btn-lg" id="resetBtn">
                <span class="me-2">⚠️</span> Reset Database
              </button>
            </div>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card-header">
            <h5 class="mb-0">👤 Admin Profile</h5>
          </div>
          <div class="card-body">
            ${adminProfile ? `
              <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0">
                  <div class="display-4">👨‍💼</div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="mb-1 fw-bold">${adminProfile.username}</h6>
                  <p class="mb-0 text-muted small">Administrator</p>
                </div>
              </div>
              <hr>
              <div class="mb-2">
                <strong>📧 Email:</strong> ${adminProfile.email}
              </div>
              <div>
                <strong>📱 Mobile:</strong> ${adminProfile.mobileno}
              </div>
            ` : `
              <div class="text-center py-3">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted small">Loading profile...</p>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupSettings() {
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
      await changePassword(currentPassword, newPassword);
      document.getElementById('passwordForm').reset();
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  });

  document.getElementById('exportBtn').addEventListener('click', exportDatabase);

  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importDatabase(file);
      } catch (error) {
        showAlert(error.message, 'danger');
      }
    }
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the database? This will delete all student records.')) {
      resetStudents();
    }
  });
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

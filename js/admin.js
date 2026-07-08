document.addEventListener('DOMContentLoaded', () => {
  // --- AUTHENTICATION FLOW ---
  const loginWrapper = document.getElementById('admin-login-wrapper');
  const dashboardContainer = document.getElementById('admin-dashboard-container');
  const loginForm = document.getElementById('admin-login-form');
  const loginErrorMsg = document.getElementById('login-error-message');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const passToggle = document.getElementById('password-toggle-btn');
  const passInput = document.getElementById('password');

  // Password Visibility Toggle
  if (passToggle && passInput) {
    passToggle.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      passToggle.innerHTML = isPass 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#78002e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#78002e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  // Check Session Storage for active login session
  if (sessionStorage.getItem('warriors_admin_logged_in') === 'true') {
    if (loginWrapper) loginWrapper.style.display = 'none';
    dashboardContainer.style.display = 'block';
    initDashboard();
  }

  // Handle Login Form Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = passInput.value;

    // Specific Rotaract Warriors credentials
    if (user === 'Racwarriors2023@gmail.com' && pass === 'Lathiesh@2002') {
      loginErrorMsg.style.display = 'none';
      if (loginWrapper) loginWrapper.style.display = 'none';
      dashboardContainer.style.display = 'block';
      sessionStorage.setItem('warriors_admin_logged_in', 'true');
      initDashboard();
    } else {
      loginErrorMsg.style.display = 'block';
    }
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('warriors_admin_logged_in');
    if (loginWrapper) loginWrapper.style.display = 'flex';
    dashboardContainer.style.display = 'none';
  });

  // --- DASHBOARD AND NAVIGATION LOGIC ---
  function initDashboard() {
    setupSidebarNavigation();
    loadDashboardStats();
    loadProjectsTable();
    loadEventsTable();
    loadRegistrationsTable();
    renderOverviewChart();
  }

  function setupSidebarNavigation() {
    const sidebarBtns = document.querySelectorAll('.admin-sidebar-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    sidebarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        sidebarBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));

        e.target.classList.add('active');
        const tabId = `tab-${e.target.getAttribute('data-tab')}`;
        document.getElementById(tabId).classList.add('active');
      });
    });
  }

  // --- DATABASE REFRESH & STATS ---
  function loadDashboardStats() {
    const projects = JSON.parse(localStorage.getItem('warriors_projects')) || [];
    const registrations = JSON.parse(localStorage.getItem('warriors_registrations')) || [];
    
    document.getElementById('stat-projects').innerText = projects.length;
    
    // Count pending registrations
    const pendingCount = registrations.filter(r => r.status === 'Pending Review').length;
    document.getElementById('stat-applications').innerText = pendingCount;
  }

  // --- MANAGE PROJECTS CRUD ---
  const projectModal = document.getElementById('admin-project-modal');
  const addProjectBtn = document.getElementById('add-project-btn');
  const projectModalClose = document.getElementById('project-modal-close-btn');
  const projectForm = document.getElementById('admin-project-form');
  const editProjectIdInput = document.getElementById('edit-project-id');
  const projectFormTitle = document.getElementById('project-form-title');

  // Open Add Project Modal
  addProjectBtn.addEventListener('click', () => {
    projectForm.reset();
    editProjectIdInput.value = '';
    projectFormTitle.innerText = 'Add New Project';
    projectModal.classList.add('active');
  });

  projectModalClose.addEventListener('click', () => projectModal.classList.remove('active'));

  // Handle Project Form Submission (Create and Update)
  projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let projects = JSON.parse(localStorage.getItem('warriors_projects')) || [];
    const editId = editProjectIdInput.value;

    const projectData = {
      id: editId || "p_" + Date.now(),
      title: document.getElementById('proj-title').value,
      category: document.getElementById('proj-category').value,
      date: document.getElementById('proj-date').value,
      impact: document.getElementById('proj-impact').value,
      excerpt: document.getElementById('proj-excerpt').value,
      description: document.getElementById('proj-desc').value,
      hue: getRandomHueByCategory(document.getElementById('proj-category').value)
    };

    if (editId) {
      // Edit mode: replace existing project
      const index = projects.findIndex(p => p.id === editId);
      if (index !== -1) {
        projects[index] = projectData;
      }
    } else {
      // Create mode: append project
      projects.unshift(projectData);
    }

    localStorage.setItem('warriors_projects', JSON.stringify(projects));
    projectModal.classList.remove('active');
    
    // Refresh admin views
    loadProjectsTable();
    loadDashboardStats();
    renderOverviewChart();
  });

  function loadProjectsTable() {
    const projects = JSON.parse(localStorage.getItem('warriors_projects')) || [];
    const tbody = document.getElementById('admin-projects-table-body');
    tbody.innerHTML = '';

    projects.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">${p.title}</td>
        <td><span style="font-size:0.8rem; border: 1px solid var(--glass-border-hover); padding: 0.2rem 0.5rem; border-radius: 4px;">${p.category}</span></td>
        <td style="color:var(--text-muted); font-size:0.9rem;">${p.date}</td>
        <td style="color:var(--color-accent); font-weight:500;">${p.impact}</td>
        <td class="admin-actions-cell">
          <button class="btn-icon edit" data-id="${p.id}" title="Edit Project">✏</button>
          <button class="btn-icon delete" data-id="${p.id}" title="Delete Project">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Add listeners to actions
    tbody.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openEditProjectModal(id);
      });
    });

    tbody.querySelectorAll('.btn-icon.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        deleteProject(id);
      });
    });
  }

  function openEditProjectModal(id) {
    const projects = JSON.parse(localStorage.getItem('warriors_projects')) || [];
    const project = projects.find(p => p.id === id);
    if (!project) return;

    editProjectIdInput.value = project.id;
    document.getElementById('proj-title').value = project.title;
    document.getElementById('proj-category').value = project.category;
    document.getElementById('proj-date').value = project.date;
    document.getElementById('proj-impact').value = project.impact;
    document.getElementById('proj-excerpt').value = project.excerpt;
    document.getElementById('proj-desc').value = project.description;

    projectFormTitle.innerText = 'Edit Project Details';
    projectModal.classList.add('active');
  }

  function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
      let projects = JSON.parse(localStorage.getItem('warriors_projects')) || [];
      projects = projects.filter(p => p.id !== id);
      localStorage.setItem('warriors_projects', JSON.stringify(projects));
      
      loadProjectsTable();
      loadDashboardStats();
      renderOverviewChart();
    }
  }

  // Category Color Map Utility
  function getRandomHueByCategory(category) {
    switch (category) {
      case 'Community Service': return 342; // Cranberry
      case 'Professional Development': return 217; // Royal Blue
      case 'Club Service': return 43; // Gold
      case 'International Service': return 280; // Purple
      default: return 200;
    }
  }

  // --- MANAGE EVENTS CRUD ---
  const eventModal = document.getElementById('admin-event-modal');
  const addEventBtn = document.getElementById('add-event-btn');
  const eventModalClose = document.getElementById('event-modal-close-btn');
  const eventForm = document.getElementById('admin-event-form');

  addEventBtn.addEventListener('click', () => {
    eventForm.reset();
    eventModal.classList.add('active');
  });

  eventModalClose.addEventListener('click', () => eventModal.classList.remove('active'));

  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let events = JSON.parse(localStorage.getItem('warriors_events')) || [];
    const eventData = {
      id: "e_" + Date.now(),
      title: document.getElementById('evt-title').value,
      category: document.getElementById('evt-category').value,
      date: document.getElementById('evt-date').value,
      time: document.getElementById('evt-time').value,
      venue: document.getElementById('evt-venue').value,
      desc: document.getElementById('evt-desc').value
    };

    events.push(eventData);
    localStorage.setItem('warriors_events', JSON.stringify(events));
    eventModal.classList.remove('active');
    
    loadEventsTable();
  });

  function loadEventsTable() {
    const events = JSON.parse(localStorage.getItem('warriors_events')) || [];
    const tbody = document.getElementById('admin-events-table-body');
    tbody.innerHTML = '';

    events.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">${e.title}</td>
        <td><span style="font-size:0.75rem; text-transform:uppercase; border: 1px solid var(--glass-border-hover); padding: 0.15rem 0.4rem; border-radius: 4px;">${e.category}</span></td>
        <td style="color:var(--text-muted); font-size:0.9rem;">${e.date} <br> <span style="font-size:0.8rem; color:var(--text-dim);">${e.time}</span></td>
        <td style="color:var(--text-muted); font-size:0.9rem;">${e.venue}</td>
        <td class="admin-actions-cell">
          <button class="btn-icon delete" data-id="${e.id}" title="Delete Event">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-icon.delete').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const id = ev.target.getAttribute('data-id');
        deleteEvent(id);
      });
    });
  }

  function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
      let events = JSON.parse(localStorage.getItem('warriors_events')) || [];
      events = events.filter(e => e.id !== id);
      localStorage.setItem('warriors_events', JSON.stringify(events));
      
      loadEventsTable();
    }
  }

  // --- REGISTRATIONS PANEL ---
  function loadRegistrationsTable() {
    const registrations = JSON.parse(localStorage.getItem('warriors_registrations')) || [];
    const tbody = document.getElementById('admin-registrations-table-body');
    tbody.innerHTML = '';

    if (registrations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding: 2rem 0;">No membership applications recorded yet. Try submitting the join form!</td></tr>`;
      return;
    }

    registrations.forEach(r => {
      const statusColor = r.status === 'Approved' 
        ? '#4caf50' 
        : r.status === 'Declined' 
          ? '#f44336' 
          : 'var(--color-accent)';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:600;">${r.name}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${r.email} | ${r.phone}</div>
        </td>
        <td style="font-size:0.9rem;">${r.occupation} <br> <span style="font-size:0.8rem; color:var(--text-dim);">${r.institution}</span></td>
        <td><span style="font-size:0.8rem; border:1px solid var(--glass-border); padding:0.2rem 0.5rem; border-radius:4px;">${r.interest}</span></td>
        <td><span style="color: ${statusColor}; font-weight:600; font-size:0.9rem;">${r.status}</span></td>
        <td>
          ${r.status === 'Pending Review' ? `
            <button class="btn btn-outline approve-btn" data-id="${r.id}" style="padding: 0.35rem 0.8rem; font-size: 0.75rem; border-color:#4caf50; color:#4caf50;">Approve</button>
            <button class="btn btn-outline decline-btn" data-id="${r.id}" style="padding: 0.35rem 0.8rem; font-size: 0.75rem; border-color:#f44336; color:#f44336;">Decline</button>
          ` : `<span style="font-size:0.8rem; color:var(--text-dim);">No pending actions</span>`}
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Event listeners for verification buttons
    tbody.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        updateRegistrationStatus(ev.target.getAttribute('data-id'), 'Approved');
      });
    });

    tbody.querySelectorAll('.decline-btn').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        updateRegistrationStatus(ev.target.getAttribute('data-id'), 'Declined');
      });
    });
  }

  function updateRegistrationStatus(id, newStatus) {
    let registrations = JSON.parse(localStorage.getItem('warriors_registrations')) || [];
    const index = registrations.findIndex(r => r.id === id);
    if (index !== -1) {
      registrations[index].status = newStatus;
      
      // If approved, increment mock member counter for fun
      if (newStatus === 'Approved') {
        let membersCount = parseInt(document.getElementById('stat-members').innerText);
        document.getElementById('stat-members').innerText = membersCount + 1;
      }

      localStorage.setItem('warriors_registrations', JSON.stringify(registrations));
      
      loadRegistrationsTable();
      loadDashboardStats();
    }
  }

  // --- CHART RENDERING LOGIC ---
  function renderOverviewChart() {
    const projects = JSON.parse(localStorage.getItem('warriors_projects')) || [];
    const chartContainer = document.getElementById('overview-chart');
    chartContainer.innerHTML = '';

    const avenues = [
      "Community Service",
      "Professional Development",
      "Club Service",
      "International Service"
    ];

    // Compute counts
    const avenueCounts = {
      "Community Service": 0,
      "Professional Development": 0,
      "Club Service": 0,
      "International Service": 0
    };

    projects.forEach(p => {
      if (avenueCounts.hasOwnProperty(p.category)) {
        avenueCounts[p.category]++;
      }
    });

    // Find max value to scale chart proportionally
    const values = Object.values(avenueCounts);
    const maxVal = Math.max(...values, 4); // Default minimum scale of 4 projects

    avenues.forEach(av => {
      const count = avenueCounts[av];
      const percent = (count / maxVal) * 80; // Scaled to 80% maximum height of container

      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';
      barWrapper.innerHTML = `
        <div class="chart-bar" style="height: ${percent}%; background: ${getBarGradientByAvenue(av)};">
          <span class="chart-bar-value">${count}</span>
        </div>
        <div class="chart-label">${av.split(' ')[0]}</div>
      `;
      chartContainer.appendChild(barWrapper);
    });
  }

  function getBarGradientByAvenue(avenue) {
    switch (avenue) {
      case 'Community Service':
        return 'linear-gradient(to top, var(--color-secondary), #ff4081)';
      case 'Professional Development':
        return 'linear-gradient(to top, var(--color-primary), #448aff)';
      case 'Club Service':
        return 'linear-gradient(to top, var(--color-accent), #ffe082)';
      case 'International Service':
        return 'linear-gradient(to top, #7b1fa2, #e040fb)';
      default:
        return 'linear-gradient(to top, #607d8b, #cfd8dc)';
    }
  }
});

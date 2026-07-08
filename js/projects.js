// Default Mock Projects Dataset
const DEFAULT_PROJECTS = [
  {
    id: "p1",
    title: "Annual Mega Blood Donation Drive",
    category: "Community Service",
    date: "2026-06-14",
    impact: "250+ blood units collected",
    excerpt: "In collaboration with the Rotary Club of Bangalore, we successfully collected 250+ units of blood for government hospitals.",
    description: "Our Mega Blood Donation Drive is one of our flagship community service initiatives. Conducted at the Bangalore Central Town Hall, we saw participation from college students, working professionals, and local residents. With a team of 30 Rotaractors running coordination, registration, and post-donation care, the collected blood units were safely cataloged and transferred to the Bowring Hospital Blood Bank, helping bridge critical seasonal shortages.",
    hue: 342 // Red-Cranberry theme
  },
  {
    id: "p2",
    title: "Ignite: Youth Leadership Summit",
    category: "Professional Development",
    date: "2026-05-20",
    impact: "180+ attendees trained",
    excerpt: "A day-long conference hosting industry leaders, networking panels, and soft skill workshops for college graduates.",
    description: "Ignite 2026 was organized with the goal of bridging the gap between college education and corporate readiness. Featuring three keynotes from top tech entrepreneurs, panel discussions on artificial intelligence, and interactive break-out rooms focusing on resume writing and professional communication, the summit provided concrete professional mentorship to graduating students in Bangalore.",
    hue: 217 // Blue theme
  },
  {
    id: "p3",
    title: "Green Warriors: Sapling Plantation",
    category: "Community Service",
    date: "2026-04-18",
    impact: "500 saplings planted & geotagged",
    excerpt: "Planting and pledging protection to 500 indigenous saplings along public spaces in North Bangalore.",
    description: "In response to urban heating challenges, the Green Warriors project saw our members plant 500 saplings across parks and residential layouts. We did not stop at planting: each tree was geotagged, assigned a neighborhood volunteer guardian, and protected by a robust biodegradable tree guard to ensure high survival rates over the upcoming monsoon.",
    hue: 142 // Green theme
  },
  {
    id: "p4",
    title: "Project Saksham: Sign Language Basic Workshop",
    category: "Professional Development",
    date: "2026-03-10",
    impact: "60+ certified learners",
    excerpt: "An inclusive workshop educating members and students in the basics of Indian Sign Language.",
    description: "Project Saksham focused on community inclusion. By partnering with certified interpreters, we hosted a 2-day workshop teaching fingerspelling, common expressions, and conversations in Indian Sign Language (ISL). The goal is to make our community service projects and daily interactions more inclusive for deaf and hard-of-hearing citizens.",
    hue: 43 // Gold theme
  },
  {
    id: "p5",
    title: "Global Harmony: Virtual Joint Meeting",
    category: "International Service",
    date: "2026-02-15",
    impact: "4 international clubs connected",
    excerpt: "A collaborative virtual exchange sharing cultural traditions, project ideas, and global fellowship goals.",
    description: "Recognizing that Rotaract is a global family, we organized a Virtual Joint Meeting with Rotaract clubs in Germany, Brazil, and Nepal. Each club presented a local community challenge and their implementation strategy, fostering cross-border learning, sharing of ideas, and international camaraderie.",
    hue: 280 // Purple theme
  }
];

document.addEventListener('DOMContentLoaded', () => {
  let projects = [];
  const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
  
  const loadProjectsFromAPI = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects?status=published`);
      if (res.ok) {
        projects = await res.json();
      } else {
        throw new Error('API Offline');
      }
    } catch (err) {
      console.warn('Failed to load projects from REST API, falling back to localStorage:', err);
      try {
        const localStr = localStorage.getItem('warriors_projects');
        if (localStr) {
          const parsed = JSON.parse(localStr);
          projects = parsed.filter(p => p.status === 'Published' || p.isPublished !== false);
        }
      } catch (e) {}
    }
    renderProjects();
  };

  const projectsGrid = document.getElementById('projects-grid');
  const searchInput = document.getElementById('project-search');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const noProjectsMsg = document.getElementById('no-projects-message');
  
  // Modal Elements
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalHero = document.getElementById('modal-hero-container');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDate = document.getElementById('modal-date');
  const modalImpact = document.getElementById('modal-impact');
  const modalDesc = document.getElementById('modal-description');

  let activeFilter = 'all';
  let searchQuery = '';

  // Render Function
  function renderProjects() {
    projectsGrid.innerHTML = '';
    
    const filtered = projects.filter(p => {
      if (p.isPublished === false) return false;
      const titleText = p.title || p.name || '';
      const excerptText = p.excerpt || p.description || '';
      const categoryText = p.category || '';
      
      const matchesFilter = activeFilter === 'all' || categoryText === activeFilter;
      const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            excerptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            categoryText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      noProjectsMsg.style.display = 'block';
      return;
    } else {
      noProjectsMsg.style.display = 'none';
    }

    filtered.forEach(project => {
      const card = document.createElement('div');
      card.className = 'glass-panel project-card animate-fade-in';
      const title = project.title || project.name || 'Untitled Project';
      const excerpt = project.excerpt || project.description || 'No description available.';
      const dateVal = project.date || new Date().toISOString().split('T')[0];
      const category = project.category || 'General';
      const displayTitle = title.length > 24 ? title.substring(0, 24) + '...' : title;
      
      card.innerHTML = `
        <div class="project-thumbnail" style="position: relative; overflow: hidden; height: 200px;">
          <div class="project-tag" style="z-index: 10;">${category}</div>
          <img src="${project.cover_image || project.image || 'assets/projects/proj-0.png'}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index: 5;" onError="this.style.display='none';" />
          <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: hsl(${project.hue || 217}, 45%, 12%);">
            <circle cx="200" cy="100" r="80" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.15" />
            <circle cx="200" cy="100" r="50" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.25" />
            <path d="M50 150 Q200 80 350 150" stroke="hsl(${project.hue || 217}, 80%, 60%)" stroke-width="3" fill="none" stroke-dasharray="10 5" />
            <text x="200" y="105" fill="white" font-size="14" text-anchor="middle" font-weight="600" font-family="sans-serif">${displayTitle}</text>
          </svg>
        </div>
        <div class="project-content">
          <h3 class="project-title">${title}</h3>
          <p class="project-excerpt">${excerpt}</p>
          <div class="project-footer">
            <span class="project-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${formatDate(dateVal)}
            </span>
            <button class="btn btn-outline view-details-btn" data-id="${project.id}" style="padding: 0.45rem 1rem; font-size: 0.8rem;">Read More</button>
          </div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });

    // Add listeners to Detail Buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openProjectModal(id);
      });
    });
  }

  // Formatting Date Utility
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }

  // Filter Buttons Click Handling
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      renderProjects();
    });
  });

  // Search Input listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProjects();
    });
  }

  // Open Detailed Modal
  function openProjectModal(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    modalTitle.innerText = project.title || project.name || 'Untitled Project';
    modalCategory.innerText = project.category || project.avenue || 'General';
    modalDate.innerText = formatDate(project.date || new Date().toISOString().split('T')[0]);
    modalImpact.innerText = project.impact || "N/A";
    modalDesc.innerText = project.description || project.full_description || project.excerpt || 'No description available.';

    // Draw modal hero background SVG based on theme color
    modalHero.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
        <img src="${project.cover_image || project.image || 'assets/projects/proj-0.png'}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index: 5;" onError="this.style.display='none';" />
        <svg width="100%" height="100%" viewBox="0 0 800 350" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: hsl(${project.hue || 217}, 45%, 8%); width: 100%; height: 100%;">
          <circle cx="400" cy="175" r="150" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.15" />
          <circle cx="400" cy="175" r="100" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.25" />
          <path d="M100 250 Q400 100 700 250" stroke="hsl(${project.hue || 217}, 80%, 65%)" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M150 270 Q400 150 650 270" stroke="hsl(${project.hue || 217}, 80%, 55%)" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 10" />
          <text x="400" y="185" fill="white" font-size="32" font-weight="800" text-anchor="middle" font-family="Poppins, sans-serif" opacity="0.8">PROJECT WARRIORS</text>
        </svg>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scroll
  }

  // Close Modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable page scroll
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside content area
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Initial Render
  loadProjectsFromAPI();
});
